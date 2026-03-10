"use client";

import { useSyncExternalStore } from "react";
import { CollectedItem, SpawnedItem, ITEM_REGISTRY, getItemDef } from "./types";
import { setSavingStatus } from "../SaveIndicator";
import { INVENTORY, ITEM_SPAWN_CONFIG, WORLD } from "../settings/settings";

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

  // Fire-and-forget: save to DB (non-blocking)
  const collectedItem = newItems.find((i) => i.itemId === itemId);
  if (collectedItem) {
    setSavingStatus("Saving…");
    fetch("/api/game/save-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity: collectedItem.quantity }),
    }).catch(() => {}); // silent fail — don't break the game
  }
}

// ─── Add an item arbitrarily (without world spawn ID) ────────
export function addItems(itemId: string, amount: number = 1) {
  const current = getInventoryState();
  const existing = current.items.find((i) => i.itemId === itemId);
  let newItems: CollectedItem[];
  let finalQuantity = amount;

  if (existing) {
    newItems = current.items.map((i) => {
      if (i.itemId === itemId) {
        finalQuantity = i.quantity + amount;
        return { ...i, quantity: finalQuantity };
      }
      return i;
    });
  } else {
    newItems = [...current.items, { itemId, quantity: amount }];
  }

  setInventoryState({ items: newItems });
  setSavingStatus("Saving…");
  fetch("/api/game/save-item", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity: finalQuantity }),
  }).catch(() => {});
}

// ─── Remove an item arbitrarily ──────────────────────────────
export function removeItems(itemId: string, amount: number = 1): boolean {
  const current = getInventoryState();
  const existing = current.items.find((i) => i.itemId === itemId);

  if (!existing || existing.quantity < amount) {
    return false; // Cannot remove if insufficient quantity
  }

  let finalQuantity = existing.quantity - amount;
  let newItems: CollectedItem[];

  if (finalQuantity <= 0) {
    finalQuantity = 0;
    newItems = current.items.filter((i) => i.itemId !== itemId);
  } else {
    newItems = current.items.map((i) =>
      i.itemId === itemId ? { ...i, quantity: finalQuantity } : i
    );
  }

  setInventoryState({ items: newItems });
  setSavingStatus("Saving…");
  fetch("/api/game/save-item", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity: finalQuantity }),
  }).catch(() => {});

  return true;
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
  const WORLD_SPREAD = INVENTORY.WORLD_SPREAD;
  const EXCLUSION_RADIUS_SQ = INVENTORY.BUILDING_EXCLUSION_SQ;
  const PORTAL_X = INVENTORY.PORTAL_EXCLUSION_X;
  const PORTAL_Z = INVENTORY.PORTAL_EXCLUSION_Z;
  const PORTAL_EXCLUSION_SQ = INVENTORY.PORTAL_EXCLUSION_SQ;

  // Day world gets fewer items
  const dayMultiplier = realm === "day" ? INVENTORY.DAY_SPAWN_MULTIPLIER : 1.0;

  // ── GLOBAL ITEM CAP ──
  // Count total items in player inventory
  const totalInInventory = inv.items.reduce((sum, i) => sum + i.quantity, 0);
  // Count items already spawned in the OTHER realm
  const otherRealm = realm === "night" ? "day" : "night";
  const otherRealmItems = (inv.worldItems[otherRealm] || []).filter(si => !si.collected).length;
  let globalBudget = INVENTORY.MAX_TOTAL_ITEMS - totalInInventory - otherRealmItems;

  for (const def of ITEM_REGISTRY) {
    if (globalBudget <= 0) break;

    const collected = getCollectedCount(def.id);
    // Apply probability from master config
    const spawnConfig = ITEM_SPAWN_CONFIG[def.id];
    const probability = spawnConfig?.probability ?? 1.0;
    const baseMax = spawnConfig?.maxSpawn ?? def.maxSpawn;
    const effectiveMax = Math.floor(baseMax * dayMultiplier * probability);
    const toSpawn = Math.min(Math.max(0, effectiveMax - collected), globalBudget);

    for (let i = 0; i < toSpawn; i++) {
      let x: number, z: number;
      let attempts = 0;

      // Find a valid position (not inside building, portal, or too close to center)
      do {
        x = (random() - 0.5) * WORLD_SPREAD * 2;
        z = (random() - 0.5) * WORLD_SPREAD * 2;
        attempts++;
      } while (
        attempts < INVENTORY.MAX_SPAWN_ATTEMPTS &&
        (
          // Exclude building center
          (Math.abs(x) < Math.sqrt(EXCLUSION_RADIUS_SQ) && Math.abs(z) < Math.sqrt(EXCLUSION_RADIUS_SQ)) ||
          // Exclude portal area
          ((x - PORTAL_X) ** 2 + (z - PORTAL_Z) ** 2 < PORTAL_EXCLUSION_SQ) ||
          // Exclude fence gates (center of each side at ±FENCE_DISTANCE)
          (Math.abs(x) < INVENTORY.GATE_EXCLUSION_HALF && Math.abs(Math.abs(z) - WORLD.FENCE_DISTANCE) < INVENTORY.GATE_EXCLUSION_HALF) ||
          (Math.abs(z) < INVENTORY.GATE_EXCLUSION_HALF && Math.abs(Math.abs(x) - WORLD.FENCE_DISTANCE) < INVENTORY.GATE_EXCLUSION_HALF)
        )
      );

      spawned.push({
        id: `${realm}_${def.id}_${i}_${seed}`,
        itemId: def.id,
        position: [x, INVENTORY.SPAWN_Y, z],
        collected: false,
      });
      globalBudget--;
    }
  }

  // Store in state
  const newWorldItems = { ...inv.worldItems, [realm]: spawned };
  setInventoryState({ worldItems: newWorldItems });

  return spawned;
}
