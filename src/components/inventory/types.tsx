import { ITEM_SPAWN_CONFIG } from "../settings/settings";
// ─── Item Categories ─────────────────────────────────────
export type ItemCategory = "food" | "tool" | "medicine";

// ─── Item Definition (registry entry) ────────────────────
export interface InventoryItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  color: string;       // primary color for the 3D model
  emissive: string;    // glow color
  maxSpawn: number;    // max number that can exist in the world at once
  consumable?: boolean; // Can it be eaten?
  hungerRestore?: number; // How much hunger it restores
  healthRestore?: number; // How much health it restores (medicine)
  equippable?: boolean; // Can it be equipped (e.g., fire torch)?
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

  // ── Cooked Foods ──
  {
    id: "cooked_apple",
    name: "Roasted Apple",
    category: "food",
    description: "A warm, caramelized mystic apple. Restores 15 hunger.",
    color: "#cc4422",
    emissive: "#ff6644",
    maxSpawn: 0, // Cannot spawn in the wild
    consumable: true,
    hungerRestore: 15,
  },
  {
    id: "roasted_mushroom",
    name: "Mushroom Skewer",
    category: "food",
    description: "Savory roasted shadow mushrooms. Restores 25 hunger.",
    color: "#9a4a7a",
    emissive: "#cc66aa",
    maxSpawn: 0,
    consumable: true,
    hungerRestore: 25,
  },
  {
    id: "sweet_jam",
    name: "Moonberry Jam",
    category: "food",
    description: "A rich, glowing jam made from berries and cheese. Restores 40 hunger.",
    color: "#d04060",
    emissive: "#f06080",
    maxSpawn: 0,
    consumable: true,
    hungerRestore: 40,
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
    equippable: true,
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

  // ── Medicine ──
  {
    id: "health_potion",
    name: "Health Potion",
    category: "medicine",
    description: "A shimmering crimson elixir. Restores 30 health.",
    color: "#cc2244",
    emissive: "#ff3355",
    maxSpawn: 3,
    consumable: true,
    healthRestore: 30,
  },
  {
    id: "healing_herb",
    name: "Healing Herb",
    category: "medicine",
    description: "A luminous green herb with restorative properties. Restores 15 health.",
    color: "#22aa44",
    emissive: "#44cc66",
    maxSpawn: 4,
    consumable: true,
    healthRestore: 15,
  },
  {
    id: "antidote_vial",
    name: "Antidote Vial",
    category: "medicine",
    description: "A potent restorative brew. Restores 50 health.",
    color: "#4488cc",
    emissive: "#66aaee",
    maxSpawn: 2,
    consumable: true,
    healthRestore: 50,
  },
];

// ─── Helper to look up item def by id ────────────────────
export function getItemDef(itemId: string): InventoryItemDef | undefined {
  return ITEM_REGISTRY.find((item) => item.id === itemId);
}
