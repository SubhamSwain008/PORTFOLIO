"use client";

import { useSyncExternalStore } from "react";
import { setInventoryState } from "./inventory/inventory";
import { setHungerState } from "./useHungerStore";
import { setHealthState } from "./useHealthStore";
import { netFetch, NetFetchError } from "@/lib/netFetch";

// ─── Types ───────────────────────────────────────────────
export type AppPhase = "loading" | "mode-select" | "login" | "game";
export type AppMode = "demo" | "login";

export interface SessionState {
  appPhase: AppPhase;
  mode: AppMode;
  userEmail: string | null;
  musicEnabled: boolean;
  gameDataLoaded: boolean;
  initialPosition: { x: number; y: number; z: number } | null;
  currentWorld: string;
  firstTimePlayed: boolean;
  currentChapter: number;
  storyConversations: Array<{ speaker: string; text: string; chapter: number }>;
  chapterCompleted: number[];
}

// ─── Singleton store ─────────────────────────────────────
let state: SessionState = {
  appPhase: "loading",
  mode: "demo",
  userEmail: null,
  musicEnabled: true,
  gameDataLoaded: false,
  initialPosition: null,
  currentWorld: "night",
  firstTimePlayed: false,
  currentChapter: 1,
  storyConversations: [],
  chapterCompleted: [],
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const l of listeners) l();
}

export function getSessionState(): SessionState {
  return state;
}

export function setSessionState(partial: Partial<SessionState>) {
  state = { ...state, ...partial };
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── React hook ──────────────────────────────────────────
export function useSessionStore<T>(selector: (s: SessionState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSessionState()),
    () => selector(getSessionState())
  );
}

// ─── Load game data from DB (inventory, position, world) ─
// Returns:
//   { ok: true, hydrated: true }  — data loaded into stores
//   { ok: true, hydrated: false } — request succeeded but no data
//   { ok: false, transient: true } — network/timeout/5xx; should retry
//   { ok: false, transient: false } — 4xx; session likely invalid
export async function loadGameData(): Promise<{
  ok: boolean;
  hydrated?: boolean;
  transient?: boolean;
}> {
  try {
    // Generous timeout + 2 retries for hydration (critical path)
    const gameRes = await netFetch("/api/game/load", {
      timeoutMs: 20000,
      retries: 2,
      backoffMs: 600,
    });
    if (!gameRes.ok) {
      const transient = gameRes.status >= 500;
      return { ok: false, transient };
    }
    const gameData = await gameRes.json();
    if (!gameData.ok) return { ok: true, hydrated: false };

    if (gameData.inventory && Array.isArray(gameData.inventory) && gameData.inventory.length > 0) {
      setInventoryState({ items: gameData.inventory });
    }
    if (gameData.hunger !== undefined) {
      setHungerState({ hunger: gameData.hunger });
    }
    if (gameData.health !== undefined) {
      setHealthState({ health: gameData.health });
    }
    if (gameData.position) {
      setSessionState({
        initialPosition: gameData.position,
        currentWorld: gameData.currentWorld || "hall",
        firstTimePlayed: gameData.firstTimePlayed ?? false,
        currentChapter: gameData.currentChapter ?? 1,
        storyConversations: gameData.storyConversations ?? [],
        chapterCompleted: gameData.chapterCompleted ?? [],
      });
    }
    return { ok: true, hydrated: true };
  } catch (err) {
    // NetFetchError — timeout or network. Definitely transient.
    if (err instanceof NetFetchError) {
      return { ok: false, transient: true };
    }
    return { ok: false, transient: true };
  }
}

// ─── Init: check existing session + load game data ───────
// Key fix: never downgrade to "mode-select" on transient failures.
// Only explicit 401 from /api/auth/me counts as "not logged in".
export async function initSession() {
  // Load persisted music preference
  if (typeof window !== "undefined") {
    const savedMusic = localStorage.getItem("musicEnabled");
    if (savedMusic !== null) {
      setSessionState({ musicEnabled: savedMusic === "true" });
    }
  }

  let authRes: Response | null = null;
  try {
    authRes = await netFetch("/api/auth/me", {
      timeoutMs: 15000,
      retries: 2,
      backoffMs: 500,
    });
  } catch {
    // Network/timeout — DO NOT log out. Keep current state; let the
    // NetworkMonitor HUD show the problem so the user knows why.
    // If this was the first boot (no prior session), fall through to
    // mode-select so the user can at least see the menu.
    if (!getSessionState().userEmail) {
      setSessionState({ appPhase: "mode-select", gameDataLoaded: true });
    } else {
      setSessionState({ appPhase: "game", gameDataLoaded: true });
    }
    return;
  }

  if (authRes.status === 401) {
    // Truly logged out
    setSessionState({ appPhase: "mode-select", gameDataLoaded: true });
    return;
  }

  if (!authRes.ok) {
    // 5xx / 503 transient — keep prior session intact, proceed to game.
    if (!getSessionState().userEmail) {
      setSessionState({ appPhase: "mode-select", gameDataLoaded: true });
    } else {
      setSessionState({ appPhase: "game", gameDataLoaded: true });
    }
    return;
  }

  const data = await authRes.json().catch(() => ({ ok: false }));
  if (!data.ok || !data.email) {
    setSessionState({ appPhase: "mode-select", gameDataLoaded: true });
    return;
  }

  setSessionState({
    userEmail: data.email,
    mode: "login",
  });

  const result = await loadGameData();
  // Only act on routing if we actually hydrated fresh data
  if (result.ok && result.hydrated) {
    const session = getSessionState();
    if (session.initialPosition && !window.location.search.includes("portal=true")) {
      const W_ROUTES: Record<string, string> = { night: "/", day: "/realm", hall: "/hall" };
      const targetRoute = W_ROUTES[session.currentWorld] || "/";
      const isHall = window.location.pathname === "/hall";
      if (!isHall && window.location.pathname !== targetRoute) {
        if (targetRoute === "/hall") {
          sessionStorage.setItem("hallEntryAllowed", "true");
        }
        window.location.href = targetRoute;
        return;
      }
    }
  }

  // Regardless of hydration result, enter game — the user is authenticated.
  // Stale/missing data will be re-synced by the stat stores' retry loops.
  setSessionState({ appPhase: "game", gameDataLoaded: true });
}
