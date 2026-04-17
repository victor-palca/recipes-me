import { Response } from "express";
import { RecipeService } from "../services/RecipeService";
import {
  toPaginatedRecipesResponse,
  toRecipeResponse,
} from "../mappers/recipeMapper";
import {
  createRecipeSchema,
  recipeIdParamSchema,
  recipeListQuerySchema,
  recipeSearchByNameQuerySchema,
  updateRecipeSchema,
} from "../schemas/recipeSchemas";
import { AuthenticatedRequest } from "../types/http";

export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const payload = createRecipeSchema.parse(req.body);
    const recipe = await this.recipeService.create(req.auth.sub, payload);

    res.status(201).json(toRecipeResponse(recipe));
  };

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { ingredients, page, pageSize } = recipeListQuerySchema.parse(
      req.query,
    );

    const recipes = await this.recipeService.list(req.auth.sub, ingredients, {
      page,
      pageSize,
    });

    res.status(200).json(toPaginatedRecipesResponse(recipes));
  };

  searchByName = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const { name } = recipeSearchByNameQuerySchema.parse({
      name: req.query.name,
    });

    const recipes = await this.recipeService.searchByName(req.auth.sub, name);

    res.status(200).json(recipes.map(toRecipeResponse));
  };

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id: recipeId } = recipeIdParamSchema.parse(req.params);
    const recipe = await this.recipeService.getById(req.auth.sub, recipeId);

    res.status(200).json(toRecipeResponse(recipe));
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id: recipeId } = recipeIdParamSchema.parse(req.params);
    const payload = updateRecipeSchema.parse(req.body);
    const recipe = await this.recipeService.update(
      req.auth.sub,
      recipeId,
      payload,
    );

    res.status(200).json(toRecipeResponse(recipe));
  };

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id: recipeId } = recipeIdParamSchema.parse(req.params);
    await this.recipeService.delete(req.auth.sub, recipeId);

    res.status(204).send();
  };
}
