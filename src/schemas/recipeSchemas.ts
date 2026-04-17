import { z } from "zod";

const ingredientInputSchema = z.object({
  ingredientName: z.string().trim().min(1),
  quantity: z.string().trim().min(1),
  unit: z.string().trim().min(1),
});

export const createRecipeSchema = z.object({
  title: z.string().trim().min(1),
  imageUrl: z.string().trim().url().optional(),
  videoUrl: z.string().trim().url().optional(),
  preparationMethod: z.string().trim().min(1),
  ingredients: z.array(ingredientInputSchema).min(1),
});

export const updateRecipeSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    imageUrl: z.string().trim().url().nullable().optional(),
    videoUrl: z.string().trim().url().nullable().optional(),
    preparationMethod: z.string().trim().min(1).optional(),
    ingredients: z.array(ingredientInputSchema).min(1).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided",
  });

export const recipeSearchByNameQuerySchema = z.object({
  name: z.string().trim().min(1),
});

export const recipeListQuerySchema = z.object({
  ingredients: z
    .preprocess((val) => {
      if (val === undefined || val === null) return undefined;
      const raw = Array.isArray(val) ? val : [val];
      const parts = raw.flatMap((v) =>
        `${v}`
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
      return parts.length > 0 ? parts : undefined;
    }, z.array(z.string().min(1)).optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(6),
});

export const recipeIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreateRecipeSchema = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeSchema = z.infer<typeof updateRecipeSchema>;
export type RecipeSearchByNameQuerySchema = z.infer<
  typeof recipeSearchByNameQuerySchema
>;
export type RecipeListQuerySchema = z.infer<typeof recipeListQuerySchema>;
