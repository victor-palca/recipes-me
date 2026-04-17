import { RecipeEntity } from "../../entities/recipe";

export interface CreateRecipeInput {
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  preparationMethod: string;
  userId: string;
}

export interface UpdateRecipeInput {
  title?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  preparationMethod?: string;
}

export interface RecipeWithIngredients {
  id: string;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  preparationMethod: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: string;
    unit: string;
  }>;
}

export interface ListRecipesPaginatedInput {
  userId: string;
  page: number;
  pageSize: number;
  normalizedNames?: string[];
}

export interface ListRecipesPaginatedResult {
  recipes: RecipeWithIngredients[];
  total: number;
}

export interface IRecipeRepository {
  create(input: CreateRecipeInput): Promise<RecipeEntity>;
  findById(id: string): Promise<RecipeEntity | null>;
  findByIdWithIngredients(id: string): Promise<RecipeWithIngredients | null>;
  listPaginated(
    input: ListRecipesPaginatedInput,
  ): Promise<ListRecipesPaginatedResult>;
  update(id: string, input: UpdateRecipeInput): Promise<RecipeEntity>;
  delete(id: string): Promise<void>;
  searchByTitle(
    userId: string,
    normalizedTitle: string,
  ): Promise<RecipeWithIngredients[]>;
}
