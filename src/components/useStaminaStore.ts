"use client";

import { useSyncExternalStore } from "react";

export interface StaminaState {
  stamina: number; // 0 to 100
  isSprinting: boolean;
}

let state: StaminaState = {
  stamina: 100,
  isSprinting: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const l of listeners) l();
}

export function getStaminaState(): StaminaState {
  return state;
}

export function setStaminaState(partial: Partial<StaminaState>) {
  state = { ...state, ...partial };
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStaminaStore<T>(selector: (s: StaminaState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getStaminaState()),
    () => selector(getStaminaState())
  );
}
