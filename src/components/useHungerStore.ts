"use client";

import { useSyncExternalStore } from "react";

export interface HungerState {
  hunger: number; // 0 to 100
}

let state: HungerState = {
  hunger: 100,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const l of listeners) l();
}

export function getHungerState(): HungerState {
  return state;
}

export function setHungerState(partial: Partial<HungerState>) {
  state = { ...state, ...partial };
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHungerStore<T>(selector: (s: HungerState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getHungerState()),
    () => selector(getHungerState())
  );
}
