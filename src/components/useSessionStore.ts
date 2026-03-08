"use client";

import { useSyncExternalStore } from "react";
import { setInventoryState } from "./inventory/inventory";

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
      try {
        const gameRes = await fetch("/api/game/load");
        if (gameRes.ok) {
          const gameData = await gameRes.json();
          if (gameData.ok) {
            // Hydrate inventory store
            if (gameData.inventory && Array.isArray(gameData.inventory) && gameData.inventory.length > 0) {
              setInventoryState({ items: gameData.inventory });
            }
            // Store initial position and world
            if (gameData.position) {
              setSessionState({
                initialPosition: gameData.position,
                currentWorld: gameData.currentWorld || "night",
              });

              // Smart routing logic
              // Only redirect if NOT traveling through a portal
              if (!window.location.search.includes("portal=true")) {
                const W_ROUTES: Record<string, string> = { night: "/", day: "/realm" };
                const targetRoute = W_ROUTES[gameData.currentWorld] || "/";
                
                // If we are not currently on the persistent world's route, redirect before rendering game
                if (window.location.pathname !== targetRoute) {
                  window.location.href = targetRoute;
                  return; // Stop initialization render
                }
              }
            }
          }
        }
      } catch {
        // Game data fetch failed — continue with defaults
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
