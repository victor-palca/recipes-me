import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { recipeRoutes } from "./recipeRoutes";
import { shoppingListRoutes } from "./shoppingListRoutes";

export const routes = Router();

routes.use(authRoutes);
routes.use("/recipes", recipeRoutes);
routes.use("/shopping-list", shoppingListRoutes);
