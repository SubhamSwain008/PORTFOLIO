export interface RecipeIngredient {
  itemId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  resultItemId: string; // The ID from ITEM_REGISTRY it produces
  cookTimeMs: number;
}

export const RECIPES: Recipe[] = [
  {
    id: "recipe_roasted_apple",
    name: "Roasted Apple",
    ingredients: [{ itemId: "mystic_apple", quantity: 1 }],
    resultItemId: "cooked_apple",
    cookTimeMs: 3000,
  },
  {
    id: "recipe_mushroom_skewer",
    name: "Mushroom Skewer",
    ingredients: [{ itemId: "shadow_mushroom", quantity: 2 }],
    resultItemId: "roasted_mushroom",
    cookTimeMs: 4500,
  },
  {
    id: "recipe_sweet_jam",
    name: "Moonberry Jam",
    ingredients: [
      { itemId: "ember_berry", quantity: 2 },
      { itemId: "moon_cheese", quantity: 1 },
    ],
    resultItemId: "sweet_jam",
    cookTimeMs: 6000,
  },
];
