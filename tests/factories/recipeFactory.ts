let counter = 0;

interface IngredientInput {
  ingredientName: string;
  quantity: string;
  unit: string;
}

interface RecipePayloadOverrides {
  title?: string;
  preparationMethod?: string;
  ingredients?: IngredientInput[];
}

export function makeRecipePayload(overrides: RecipePayloadOverrides = {}) {
  counter++;
  return {
    title: `Recipe ${counter}`,
    preparationMethod: "Mix everything and cook for 30 minutes.",
    ingredients: [
      { ingredientName: `ingredient-${counter}`, quantity: "200", unit: "g" },
    ],
    ...overrides,
  };
}
