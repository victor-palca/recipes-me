import { prisma } from "../../config/prisma";
import { RecipeEntity } from "../../entities/recipe";
import {
  CreateRecipeInput,
  IRecipeRepository,
  ListRecipesPaginatedInput,
  ListRecipesPaginatedResult,
  RecipeWithIngredients,
  UpdateRecipeInput,
} from "../interfaces/IRecipeRepository";

const recipeWithIngredientsInclude = {
  recipeIngredients: {
    include: {
      ingredient: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} as const;

function mapRecipeWithIngredients(recipe: {
  id: string;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  preparationMethod: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  recipeIngredients: Array<{
    ingredientId: string;
    quantity: string;
    unit: string;
    ingredient: {
      name: string;
    };
  }>;
}): RecipeWithIngredients {
  return {
    id: recipe.id,
    title: recipe.title,
    imageUrl: recipe.imageUrl,
    videoUrl: recipe.videoUrl,
    preparationMethod: recipe.preparationMethod,
    userId: recipe.userId,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    ingredients: recipe.recipeIngredients.map((item) => ({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredient.name,
      quantity: item.quantity,
      unit: item.unit,
    })),
  };
}

function buildWhereForUser(userId: string, normalizedNames?: string[]) {
  if (!normalizedNames?.length) {
    return { userId };
  }

  return {
    userId,
    AND: normalizedNames.map((name) => ({
      recipeIngredients: {
        some: {
          ingredient: { name },
        },
      },
    })),
  };
}

export class PostgresRecipeRepository implements IRecipeRepository {
  async create(input: CreateRecipeInput): Promise<RecipeEntity> {
    return prisma.recipe.create({
      data: input,
    });
  }

  async findById(id: string): Promise<RecipeEntity | null> {
    return prisma.recipe.findUnique({
      where: { id },
    });
  }

  async findByIdWithIngredients(id: string): Promise<RecipeWithIngredients | null> {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: recipeWithIngredientsInclude,
    });

    if (!recipe) {
      return null;
    }

    return mapRecipeWithIngredients(recipe);
  }

  async listPaginated(
    input: ListRecipesPaginatedInput,
  ): Promise<ListRecipesPaginatedResult> {
    const { userId, page, pageSize, normalizedNames } = input;
    const where = buildWhereForUser(userId, normalizedNames);
    const skip = (page - 1) * pageSize;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: recipeWithIngredientsInclude,
        orderBy: [{ title: "asc" }, { id: "asc" }],
        skip,
        take: pageSize,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      recipes: recipes.map(mapRecipeWithIngredients),
      total,
    };
  }

  async update(id: string, input: UpdateRecipeInput): Promise<RecipeEntity> {
    return prisma.recipe.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.recipe.delete({
      where: { id },
    });
  }

  async searchByTitle(
    userId: string,
    normalizedTitle: string,
  ): Promise<RecipeWithIngredients[]> {
    const recipes = await prisma.recipe.findMany({
      where: {
        userId,
        title: {
          contains: normalizedTitle,
          mode: "insensitive",
        },
      },
      include: recipeWithIngredientsInclude,
      orderBy: {
        title: "asc",
      },
    });

    return recipes.map(mapRecipeWithIngredients);
  }
}
