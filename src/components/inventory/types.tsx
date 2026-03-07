// ─── Item Categories ─────────────────────────────────────
export type ItemCategory = "food" | "tool";

// ─── Item Definition (registry entry) ────────────────────
export interface InventoryItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  color: string;       // primary color for the 3D model
  emissive: string;    // glow color
  maxSpawn: number;    // max number that can exist in the world at once
}

// ─── Collected item in player inventory ──────────────────
export interface CollectedItem {
  itemId: string;
  quantity: number;
}

// ─── Spawned item in the world ───────────────────────────
export interface SpawnedItem {
  id: string;          // unique instance id
  itemId: string;      // references ITEM_REGISTRY
  position: [number, number, number];
  collected: boolean;
}

// ─── Item Registry ───────────────────────────────────────
// 5 Foods + 3 Tools
export const ITEM_REGISTRY: InventoryItemDef[] = [
  // ── Foods ──
  {
    id: "mystic_apple",
    name: "Mystic Apple",
    category: "food",
    description: "A shimmering apple infused with arcane energy. Restores vitality.",
    color: "#cc2244",
    emissive: "#ff4466",
    maxSpawn: 5,
  },
  {
    id: "golden_bread",
    name: "Golden Bread",
    category: "food",
    description: "Warm bread baked with enchanted flour. Satisfies deep hunger.",
    color: "#c8a040",
    emissive: "#e8c060",
    maxSpawn: 5,
  },
  {
    id: "shadow_mushroom",
    name: "Shadow Mushroom",
    category: "food",
    description: "A bioluminescent mushroom from the dark forest floor.",
    color: "#7a3a9a",
    emissive: "#aa55cc",
    maxSpawn: 4,
  },
  {
    id: "ember_berry",
    name: "Ember Berry",
    category: "food",
    description: "Tiny berries that glow like embers. Warm to the touch.",
    color: "#e05520",
    emissive: "#ff7744",
    maxSpawn: 5,
  },
  {
    id: "moon_cheese",
    name: "Moon Cheese",
    category: "food",
    description: "Pale cheese that glows faintly under moonlight.",
    color: "#b0c8e8",
    emissive: "#c8e0ff",
    maxSpawn: 4,
  },

  // ── Tools ──
  {
    id: "crystal_pickaxe",
    name: "Crystal Pickaxe",
    category: "tool",
    description: "A pickaxe with a crystalline head. Cuts through any stone.",
    color: "#30c8d0",
    emissive: "#50e8f0",
    maxSpawn: 3,
  },
  {
    id: "torch",
    name: "Mystic Torch",
    category: "tool",
    description: "An ever-burning torch that wards off shadows.",
    color: "#d08020",
    emissive: "#ff9933",
    maxSpawn: 3,
  },
  {
    id: "ancient_compass",
    name: "Ancient Compass",
    category: "tool",
    description: "A bronze compass that always points toward hidden treasures.",
    color: "#a07040",
    emissive: "#c89060",
    maxSpawn: 3,
  },
];

// ─── Helper to look up item def by id ────────────────────
export function getItemDef(itemId: string): InventoryItemDef | undefined {
  return ITEM_REGISTRY.find((item) => item.id === itemId);
}
