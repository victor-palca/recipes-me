import { RecipeController } from "../http/RecipeController";
import { PostgresRecipeIngredientRepository } from "../repositories/postgres/PostgresRecipeIngredientRepository";
import { PostgresRecipeRepository } from "../repositories/postgres/PostgresRecipeRepository";
import { IngredientSyncService } from "../services/IngredientSyncService";
import { RecipeService } from "../services/RecipeService";

export function makeRecipeController(): RecipeController {
  const recipeRepository = new PostgresRecipeRepository();
  const recipeIngredientRepository = new PostgresRecipeIngredientRepository();

  const ingredientSyncService = new IngredientSyncService(
    recipeIngredientRepository,
  );

  const recipeService = new RecipeService(
    recipeRepository,
    ingredientSyncService,
  );

  return new RecipeController(recipeService);
}
