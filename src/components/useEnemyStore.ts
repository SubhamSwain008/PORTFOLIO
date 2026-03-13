"use client";

import { useSyncExternalStore } from "react";
import * as THREE from "three";
import { EnemyType } from "./settings/settings";

// ─── Types ───────────────────────────────────────────────
export interface ActiveEnemy {
  id: string;
  type: EnemyType;
  position: THREE.Vector3;
  hp: number;
  isChasing: boolean;
  spawnPointIndex: number;
  /** Accumulated time for walk/idle animations */
  animTime: number;
  /** Timestamp of last attack (Date.now()) */
  lastAttackTime: number;
}

export interface EnemyState {
  activeEnemies: ActiveEnemy[];
  /** Spawn point index → last spawn timestamp (Date.now()) */
  spawnCooldowns: Record<number, number>;
  /** Red flash alpha (0–1) when player is hit */
  hitFlashAlpha: number;
  /** True if player is being chased by any enemy outside the safe zone */
  isPlayerChased: boolean;
}

// ─── Singleton store ─────────────────────────────────────
let state: EnemyState = {
  activeEnemies: [],
  spawnCooldowns: {},
  hitFlashAlpha: 0,
  isPlayerChased: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const l of listeners) l();
}

export function getEnemyState(): EnemyState {
  return state;
}

export function setEnemyState(partial: Partial<EnemyState>) {
  state = { ...state, ...partial };
  emitChange();
}

/** Add an enemy to the active list */
export function spawnEnemy(enemy: ActiveEnemy) {
  state = {
    ...state,
    activeEnemies: [...state.activeEnemies, enemy],
    spawnCooldowns: {
      ...state.spawnCooldowns,
      [enemy.spawnPointIndex]: Date.now(),
    },
  };
  emitChange();
}

/** Remove an enemy by id */
export function removeEnemy(id: string) {
  state = {
    ...state,
    activeEnemies: state.activeEnemies.filter((e) => e.id !== id),
  };
  emitChange();
}

/** Clear all enemies (e.g. on death or world change) */
export function clearAllEnemies() {
  state = {
    ...state,
    activeEnemies: [],
    spawnCooldowns: {},
    hitFlashAlpha: 0,
    isPlayerChased: false,
  };
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── React hook ──────────────────────────────────────────
export function useEnemyStore<T>(selector: (s: EnemyState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getEnemyState()),
    () => selector(getEnemyState())
  );
}
