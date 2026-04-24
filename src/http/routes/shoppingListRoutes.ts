import { Router } from "express";
import { makeShoppingListController } from "../../factories/shoppingListFactory";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { asHandler } from "../../types/http";

const shoppingListController = makeShoppingListController();

export const shoppingListRoutes = Router();

shoppingListRoutes.use(authMiddleware);
shoppingListRoutes.post("/export", asHandler(shoppingListController.exportText));
