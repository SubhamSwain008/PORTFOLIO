"use client";

import { useRef, useCallback, useSyncExternalStore } from "react";

// ─── Types ───────────────────────────────────────────────
export type GameMode = "explore" | "transitioning-in" | "interior" | "transitioning-out";

export interface GameState {
    gameMode: GameMode;
    isNearEntrance: boolean;
    isNearExit: boolean;
    transitionProgress: number; // 0–1
    // ─── Multi-floor interior state ───
    currentFloor: 0 | 1;       // 0 = ground, 1 = upper
    pendingFloor: number | null; // set before fade, consumed during fade
    isNearStairs: boolean;
    isNearUpperDoor: boolean;
    isNearPortal: boolean; // New portal door proximity
    isNearGate: boolean;   // Near a fence gate opening
    isCrossingGate: boolean; // Auto-walking through a gate
    // ─── Daytime specific state ───
    isNearDayPortal: boolean;
    isNearDayGate: boolean;
    isDayCrossingGate: boolean;
    isDead: boolean;
}

// ─── Singleton store ─────────────────────────────────────
let state: GameState = {
    gameMode: "explore",
    isNearEntrance: false,
    isNearExit: false,
    transitionProgress: 0,
    currentFloor: 0,
    pendingFloor: null,
    isNearStairs: false,
    isNearUpperDoor: false,
    isNearPortal: false,
    isNearGate: false,
    isCrossingGate: false,
    isNearDayPortal: false,
    isNearDayGate: false,
    isDayCrossingGate: false,
    isDead: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
    for (const l of listeners) l();
}

export function getGameState(): GameState {
    return state;
}

export function setGameState(partial: Partial<GameState>) {
    state = { ...state, ...partial };
    emitChange();
}

function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// ─── React hook ──────────────────────────────────────────
export function useGameStore<T>(selector: (s: GameState) => T): T {
    return useSyncExternalStore(
        subscribe,
        () => selector(getGameState()),
        () => selector(getGameState())
    );
}
