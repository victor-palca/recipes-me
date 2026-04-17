import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.user.deleteMany();
}
