import { z } from "zod";

export const shoppingListExportSchema = z.object({
  recipeIds: z.array(z.string().trim().min(1)).min(1),
});

export type ShoppingListExportSchema = z.infer<typeof shoppingListExportSchema>;
