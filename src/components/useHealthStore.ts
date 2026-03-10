"use client";

import { useSyncExternalStore } from "react";
import { HEALTH } from "./settings/settings";

export interface HealthState {
  health: number; // 0 to HEALTH.MAX
}

let state: HealthState = {
  health: HEALTH.MAX,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const l of listeners) l();
}

export function getHealthState(): HealthState {
  return state;
}

export function setHealthState(partial: Partial<HealthState>) {
  state = { ...state, ...partial };
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHealthStore<T>(selector: (s: HealthState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getHealthState()),
    () => selector(getHealthState())
  );
}
