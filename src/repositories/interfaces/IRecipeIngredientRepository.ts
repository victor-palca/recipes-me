export interface RecipeIngredientCreateInput {
  recipeId: string;
  ingredientId: string;
  quantity: string;
  unit: string;
}

export interface RecipeIngredientSyncItem {
  ingredientName: string;
  quantity: string;
  unit: string;
}

export interface ShoppingListLine {
  recipeId: string;
  recipeTitle: string;
  ingredientName: string;
  quantity: string;
  unit: string;
}

export interface IRecipeIngredientRepository {
  replaceForRecipe(
    recipeId: string,
    items: RecipeIngredientCreateInput[],
  ): Promise<void>;
  replaceForRecipeWithIngredientUpsert(
    recipeId: string,
    items: RecipeIngredientSyncItem[],
  ): Promise<void>;
  listShoppingLinesByRecipeIds(
    userId: string,
    recipeIds: string[],
  ): Promise<ShoppingListLine[]>;
}
