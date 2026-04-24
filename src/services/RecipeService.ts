import { RecipeEntity, RecipeIngredientInput } from "../entities/recipe";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";
import {
  IRecipeRepository,
  RecipeWithIngredients,
  UpdateRecipeInput,
} from "../repositories/interfaces/IRecipeRepository";
import { calculateTotalPages } from "../utils/calculateTotalPages";
import { normalizeText } from "../utils/normalizeText";
import { IngredientSyncService } from "./IngredientSyncService";

export interface RecipeCreatePayload {
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  preparationMethod: string;
  ingredients: RecipeIngredientInput[];
}

export interface RecipeUpdatePayload {
  title?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  preparationMethod?: string;
  ingredients?: RecipeIngredientInput[];
}

export interface RecipeListPaginationInput {
  page: number;
  pageSize: number;
}

export interface PaginatedRecipeList {
  data: RecipeWithIngredients[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

type RecipeOwner =
  | Pick<RecipeEntity, "userId">
  | Pick<RecipeWithIngredients, "userId">;

export class RecipeService {
  constructor(
    private readonly recipeRepository: IRecipeRepository,
    private readonly ingredientSyncService: IngredientSyncService,
  ) {}

  async create(
    userId: string,
    payload: RecipeCreatePayload,
  ): Promise<RecipeWithIngredients> {
    const recipe = await this.recipeRepository.create({
      title: payload.title,
      imageUrl: payload.imageUrl,
      videoUrl: payload.videoUrl,
      preparationMethod: payload.preparationMethod,
      userId,
    });

    await this.ingredientSyncService.syncForRecipe(
      recipe.id,
      payload.ingredients,
    );

    const recipeWithIngredients =
      await this.recipeRepository.findByIdWithIngredients(recipe.id);

    if (!recipeWithIngredients) {
      throw new AppError("Recipe not found", 404, ErrorCodes.NOT_FOUND);
    }

    return recipeWithIngredients;
  }

  async list(
    userId: string,
    ingredientNames?: string[],
    pagination: RecipeListPaginationInput = { page: 1, pageSize: 6 },
  ): Promise<PaginatedRecipeList> {
    const normalizedNames = this.normalizeIngredientFilters(ingredientNames);
    const { page, pageSize } = pagination;
    const paginatedResult = await this.recipeRepository.listPaginated({
      userId,
      page,
      pageSize,
      normalizedNames: normalizedNames.length > 0 ? normalizedNames : undefined,
    });

    const totalPages = calculateTotalPages(paginatedResult.total, pageSize);

    return {
      data: paginatedResult.recipes,
      meta: {
        page,
        pageSize,
        total: paginatedResult.total,
        totalPages,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async searchByName(
    userId: string,
    name: string,
  ): Promise<RecipeWithIngredients[]> {
    const normalizedName = name.trim();

    return this.recipeRepository.searchByTitle(userId, normalizedName);
  }

  async getById(
    userId: string,
    recipeId: string,
  ): Promise<RecipeWithIngredients> {
    const recipe =
      await this.recipeRepository.findByIdWithIngredients(recipeId);

    this.assertOwnership(recipe, userId);

    return recipe;
  }

  async update(
    userId: string,
    recipeId: string,
    payload: RecipeUpdatePayload,
  ): Promise<RecipeWithIngredients> {
    const currentRecipe = await this.recipeRepository.findById(recipeId);
    this.assertOwnership(currentRecipe, userId);

    const updateInput: UpdateRecipeInput = {
      title: payload.title,
      imageUrl: payload.imageUrl,
      videoUrl: payload.videoUrl,
      preparationMethod: payload.preparationMethod,
    };

    await this.recipeRepository.update(recipeId, updateInput);

    if (payload.ingredients) {
      await this.ingredientSyncService.syncForRecipe(
        recipeId,
        payload.ingredients,
      );
    }

    const updatedRecipe =
      await this.recipeRepository.findByIdWithIngredients(recipeId);
    if (!updatedRecipe) {
      throw new AppError("Recipe not found", 404, ErrorCodes.NOT_FOUND);
    }

    return updatedRecipe;
  }

  async delete(userId: string, recipeId: string): Promise<void> {
    const recipe = await this.recipeRepository.findById(recipeId);
    this.assertOwnership(recipe, userId);

    await this.recipeRepository.delete(recipeId);
  }

  private normalizeIngredientFilters(ingredientNames?: string[]): string[] {
    if (!ingredientNames) {
      return [];
    }

    const unique = new Set<string>();

    for (const ingredientName of ingredientNames) {
      const normalizedName = normalizeText(ingredientName);
      if (normalizedName) {
        unique.add(normalizedName);
      }
    }

    return [...unique];
  }

  private assertOwnership(
    recipe: RecipeOwner | null,
    userId: string,
  ): asserts recipe is RecipeOwner {
    if (!recipe) {
      throw new AppError("Recipe not found", 404, ErrorCodes.NOT_FOUND);
    }

    if (recipe.userId !== userId) {
      throw new AppError(
        "You do not have access to this recipe",
        403,
        ErrorCodes.FORBIDDEN,
      );
    }
  }
}
