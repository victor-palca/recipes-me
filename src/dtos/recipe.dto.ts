export interface RecipeIngredientResponse {
  ingredientId: string;
  ingredientName: string;
  quantity: string;
  unit: string;
}

export interface RecipeResponse {
  id: string;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  preparationMethod: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: RecipeIngredientResponse[];
}

export interface PaginatedRecipesResponseMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedRecipesResponse {
  data: RecipeResponse[];
  meta: PaginatedRecipesResponseMeta;
}
