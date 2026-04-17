import {
  PaginatedRecipesResponse,
  RecipeResponse,
} from "../dtos/recipe.dto";
import { PaginatedRecipeList } from "../services/RecipeService";
import { RecipeWithIngredients } from "../repositories/interfaces/IRecipeRepository";

export function toRecipeResponse(recipe: RecipeWithIngredients): RecipeResponse {
  return {
    id: recipe.id,
    title: recipe.title,
    imageUrl: recipe.imageUrl,
    videoUrl: recipe.videoUrl,
    preparationMethod: recipe.preparationMethod,
    userId: recipe.userId,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ingredientId: ingredient.ingredientId,
      ingredientName: ingredient.ingredientName,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    })),
  };
}

export function toPaginatedRecipesResponse(
  result: PaginatedRecipeList,
): PaginatedRecipesResponse {
  return {
    data: result.data.map(toRecipeResponse),
    meta: result.meta,
  };
}
