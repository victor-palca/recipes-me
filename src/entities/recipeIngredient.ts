export interface RecipeIngredientEntity {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}
