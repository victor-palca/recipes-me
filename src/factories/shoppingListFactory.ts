import { ShoppingListController } from "../controllers/ShoppingListController";
import { PostgresRecipeIngredientRepository } from "../repositories/postgres/PostgresRecipeIngredientRepository";
import { ShoppingListService } from "../services/ShoppingListService";

export function makeShoppingListController(): ShoppingListController {
  const recipeIngredientRepository = new PostgresRecipeIngredientRepository();
  const shoppingListService = new ShoppingListService(recipeIngredientRepository);

  return new ShoppingListController(shoppingListService);
}
