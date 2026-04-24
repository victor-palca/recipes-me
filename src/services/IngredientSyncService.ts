import { RecipeIngredientInput } from "../entities/recipe";
import { IRecipeIngredientRepository } from "../repositories/interfaces/IRecipeIngredientRepository";
import { normalizeText } from "../utils/normalizeText";

export class IngredientSyncService {
  constructor(
    private readonly recipeIngredientRepository: IRecipeIngredientRepository,
  ) {}

  async syncForRecipe(
    recipeId: string,
    ingredients: RecipeIngredientInput[],
  ): Promise<void> {
    const deduped = new Map<string, RecipeIngredientInput>();

    for (const ingredient of ingredients) {
      const normalizedName = normalizeText(ingredient.ingredientName);
      deduped.set(normalizedName, {
        ingredientName: normalizedName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      });
    }

    await this.recipeIngredientRepository.replaceForRecipeWithIngredientUpsert(
      recipeId,
      [...deduped.values()],
    );
  }
}
