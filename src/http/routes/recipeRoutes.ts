import { Router } from "express";
import { makeRecipeController } from "../../factories/recipeFactory";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { asHandler } from "../../types/http";

const recipeController = makeRecipeController();

export const recipeRoutes = Router();

recipeRoutes.use(authMiddleware);
recipeRoutes.post("/", asHandler(recipeController.create));
recipeRoutes.get("/", asHandler(recipeController.list));
recipeRoutes.get("/search/by-name", asHandler(recipeController.searchByName));
recipeRoutes.get("/filter/by-ingredients", asHandler(recipeController.list));
recipeRoutes.get("/:id", asHandler(recipeController.getById));
recipeRoutes.put("/:id", asHandler(recipeController.update));
recipeRoutes.delete("/:id", asHandler(recipeController.delete));
