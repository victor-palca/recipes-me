import { prisma } from "../../config/prisma";
import {
  IRecipeIngredientRepository,
  RecipeIngredientCreateInput,
  RecipeIngredientSyncItem,
  ShoppingListLine,
} from "../interfaces/IRecipeIngredientRepository";

export class PostgresRecipeIngredientRepository
  implements IRecipeIngredientRepository
{
  async replaceForRecipe(
    recipeId: string,
    items: RecipeIngredientCreateInput[],
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      if (items.length === 0) {
        return;
      }

      await tx.recipeIngredient.createMany({
        data: items,
      });
    });
  }

  async replaceForRecipeWithIngredientUpsert(
    recipeId: string,
    items: RecipeIngredientSyncItem[],
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const uniqueNames = [...new Set(items.map((i) => i.ingredientName))];

      if (uniqueNames.length > 0) {
        await tx.ingredient.createMany({
          data: uniqueNames.map((name) => ({ name })),
          skipDuplicates: true,
        });
      }

      const persisted = await tx.ingredient.findMany({
        where: { name: { in: uniqueNames } },
      });
      const idByName = new Map(persisted.map((i) => [i.name, i.id]));

      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      });

      if (items.length === 0) {
        return;
      }

      await tx.recipeIngredient.createMany({
        data: items.map((item) => ({
          recipeId,
          ingredientId: idByName.get(item.ingredientName)!,
          quantity: item.quantity,
          unit: item.unit,
        })),
      });
    });
  }

  async listShoppingLinesByRecipeIds(
    userId: string,
    recipeIds: string[],
  ): Promise<ShoppingListLine[]> {
    if (recipeIds.length === 0) {
      return [];
    }

    const rows = await prisma.recipeIngredient.findMany({
      where: {
        recipeId: {
          in: recipeIds,
        },
        recipe: {
          userId,
        },
      },
      include: {
        ingredient: true,
        recipe: true,
      },
      orderBy: [
        {
          recipe: {
            title: "asc",
          },
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return rows.map((row) => ({
      recipeId: row.recipeId,
      recipeTitle: row.recipe.title,
      ingredientName: row.ingredient.name,
      quantity: row.quantity,
      unit: row.unit,
    }));
  }
}
