import { Response } from "express";
import { shoppingListExportSchema } from "../schemas/shoppingListSchemas";
import { ShoppingListService } from "../services/ShoppingListService";
import { AuthenticatedRequest } from "../types/http";

export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  exportText = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const payload = shoppingListExportSchema.parse(req.body);
    const text = await this.shoppingListService.exportText(
      req.auth.sub,
      payload.recipeIds,
    );

    res.status(200).json({ text });
  };
}
