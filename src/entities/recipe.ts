export interface RecipeEntity {
  id: string;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  preparationMethod: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredientInput {
  ingredientName: string;
  quantity: string;
  unit: string;
}
