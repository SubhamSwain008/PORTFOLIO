"use client";

import { useSyncExternalStore } from "react";
import { setInventoryState } from "./inventory/inventory";
import { setHungerState } from "./useHungerStore";

// ─── Types ───────────────────────────────────────────────
export type AppPhase = "loading" | "mode-select" | "login" | "game";
export type AppMode = "portfolio" | "demo" | "login";

export interface SessionState {
  appPhase: AppPhase;
  mode: AppMode;
  userEmail: string | null;
  musicEnabled: boolean;
  gameDataLoaded: boolean;
  initialPosition: { x: number; y: number; z: number } | null;
  currentWorld: string;
}

// ─── Singleton store ─────────────────────────────────────
let state: SessionState = {
  appPhase: "loading",
  mode: "portfolio",
  userEmail: null,
  musicEnabled: true,
  gameDataLoaded: false,
  initialPosition: null,
  currentWorld: "night",
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
export async function loadGameData(): Promise<boolean> {
  try {
    const gameRes = await fetch("/api/game/load");
    if (gameRes.ok) {
      const gameData = await gameRes.json();
      if (gameData.ok) {
        // Hydrate inventory store
        if (gameData.inventory && Array.isArray(gameData.inventory) && gameData.inventory.length > 0) {
          setInventoryState({ items: gameData.inventory });
        }
        // Hydrate hunger store
        if (gameData.hunger !== undefined) {
          setHungerState({ hunger: gameData.hunger });
        }
        // Store initial position and world
        if (gameData.position) {
          setSessionState({
            initialPosition: gameData.position,
            currentWorld: gameData.currentWorld || "night",
          });
        }
        return true;
      }
    }
  } catch {
    // Game data fetch failed — continue with defaults
  }
  return false;
}

// ─── Init: check existing session + load game data ───────
export async function initSession() {
  // Load persisted music preference
  if (typeof window !== "undefined") {
    const savedMusic = localStorage.getItem("musicEnabled");
    if (savedMusic !== null) {
      setSessionState({ musicEnabled: savedMusic === "true" });
    }
  }

  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setSessionState({
        userEmail: data.email,
        mode: "login",
      });

      // Fetch game data from DB
      const loaded = await loadGameData();
      if (loaded) {
        const session = getSessionState();
        // Smart routing logic
        // Only redirect if NOT traveling through a portal
        if (session.initialPosition && !window.location.search.includes("portal=true")) {
          const W_ROUTES: Record<string, string> = { night: "/", day: "/realm" };
          const targetRoute = W_ROUTES[session.currentWorld] || "/";
          
          // If we are not currently on the persistent world's route, redirect before rendering game
          const isHall = window.location.pathname === "/hall";
          if (!isHall && window.location.pathname !== targetRoute) {
            window.location.href = targetRoute;
            return; // Stop initialization render
          }
        }
      }

      setSessionState({
        appPhase: "game",
        gameDataLoaded: true,
      });
      return;
    }
  } catch {
    // No session
  }
  setSessionState({ appPhase: "mode-select", gameDataLoaded: true });
}
