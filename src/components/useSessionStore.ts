"use client";

import { useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────
export type AppPhase = "loading" | "mode-select" | "login" | "game";
export type AppMode = "portfolio" | "demo" | "login";

export interface SessionState {
  appPhase: AppPhase;
  mode: AppMode;
  userEmail: string | null;
  musicEnabled: boolean;
}

// ─── Singleton store ─────────────────────────────────────
let state: SessionState = {
  appPhase: "loading",
  mode: "portfolio",
  userEmail: null,
  musicEnabled: true,
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

// ─── Init: check existing session ────────────────────────
export async function initSession() {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      setSessionState({
        appPhase: "game",
        mode: "login",
        userEmail: data.email,
      });
      return;
    }
  } catch {
    // No session
  }
  setSessionState({ appPhase: "mode-select" });
}
