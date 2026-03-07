"use client";

import { useSyncExternalStore } from "react";
import { CollectedItem, SpawnedItem, ITEM_REGISTRY, getItemDef } from "./types";

// ─── Inventory State ─────────────────────────────────────
export interface InventoryState {
  items: CollectedItem[];
  // World-spawned items keyed by realm ("night" | "day")
  worldItems: Record<string, SpawnedItem[]>;
}

// ─── Nearest item prompt (mutable, NOT reactive — no re-renders) ─
// WorldItems writes this directly in useFrame.
// InventoryHUD reads it via polling interval.
export let nearestItemPrompt: { name: string; visible: boolean } = {
  name: "",
  visible: false,
};

// ─── Singleton store ─────────────────────────────────────
let state: InventoryState = {
  items: [],
  worldItems: {},
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const l of listeners) l();
}

export function getInventoryState(): InventoryState {
  return state;
}

export function setInventoryState(partial: Partial<InventoryState>) {
  state = { ...state, ...partial };
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ─── React hook ──────────────────────────────────────────
export function useInventoryStore<T>(selector: (s: InventoryState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getInventoryState()),
    () => selector(getInventoryState())
  );
}

// ─── Collect an item from the world ──────────────────────
export function collectItem(itemId: string, realm: string, spawnId: string) {
  const current = getInventoryState();

  // Add to inventory
  const existing = current.items.find((i) => i.itemId === itemId);
  let newItems: CollectedItem[];
  if (existing) {
    newItems = current.items.map((i) =>
      i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
    );
  } else {
    newItems = [...current.items, { itemId, quantity: 1 }];
  }

  // Mark as collected in world items
  const realmItems = current.worldItems[realm] || [];
  const newRealmItems = realmItems.map((si) =>
    si.id === spawnId ? { ...si, collected: true } : si
  );

  setInventoryState({
    items: newItems,
    worldItems: { ...current.worldItems, [realm]: newRealmItems },
  });
}

// ─── Get collected count for an item ─────────────────────
export function getCollectedCount(itemId: string): number {
  const inv = getInventoryState();
  const found = inv.items.find((i) => i.itemId === itemId);
  return found ? found.quantity : 0;
}

// ─── Seeded RNG (same pattern as environment.ts) ─────────
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Generate world items for a realm ────────────────────
// Respects maxSpawn minus collected. Uses a new seed each time
// so positions are random on every realm visit.
export function generateWorldItems(realm: string): SpawnedItem[] {
  const inv = getInventoryState();

  // Use a time-based seed so positions change each visit
  const seed = Math.floor(Date.now() / 1000) + (realm === "day" ? 9999 : 0);
  const random = rng(seed);

  const spawned: SpawnedItem[] = [];
  const WORLD_SPREAD = 180; // spread items across the map
  const EXCLUSION_RADIUS_SQ = 64; // 8-unit radius around building center
  const PORTAL_X = -10;
  const PORTAL_Z = -44.9;
  const PORTAL_EXCLUSION_SQ = 49; // 7-unit radius around portal

  // Day world gets 4-5x fewer items
  const dayMultiplier = realm === "day" ? 0.2 : 1.0;

  for (const def of ITEM_REGISTRY) {
    const collected = getCollectedCount(def.id);
    const toSpawn = Math.max(0, Math.floor(def.maxSpawn * dayMultiplier) - collected);

    for (let i = 0; i < toSpawn; i++) {
      let x: number, z: number;
      let attempts = 0;

      // Find a valid position (not inside building, portal, or too close to center)
      do {
        x = (random() - 0.5) * WORLD_SPREAD * 2;
        z = (random() - 0.5) * WORLD_SPREAD * 2;
        attempts++;
      } while (
        attempts < 50 &&
        (
          // Exclude building center
          (Math.abs(x) < 8 && Math.abs(z) < 8) ||
          // Exclude portal area
          ((x - PORTAL_X) ** 2 + (z - PORTAL_Z) ** 2 < PORTAL_EXCLUSION_SQ) ||
          // Exclude fence gates (center of each side at ±45)
          (Math.abs(x) < 5 && Math.abs(Math.abs(z) - 45) < 5) ||
          (Math.abs(z) < 5 && Math.abs(Math.abs(x) - 45) < 5)
        )
      );

      spawned.push({
        id: `${realm}_${def.id}_${i}_${seed}`,
        itemId: def.id,
        position: [x, 0.5, z],
        collected: false,
      });
    }
  }

  // Store in state
  const newWorldItems = { ...inv.worldItems, [realm]: spawned };
  setInventoryState({ worldItems: newWorldItems });

  return spawned;
}
