import { prisma } from "../../config/prisma";
import { IngredientEntity } from "../../entities/ingredient";
import { IIngredientRepository } from "../interfaces/IIngredientRepository";

export class PostgresIngredientRepository implements IIngredientRepository {
  async findByNormalizedName(name: string): Promise<IngredientEntity | null> {
    return prisma.ingredient.findUnique({
      where: { name },
    });
  }

  async findManyByNormalizedNames(names: string[]): Promise<IngredientEntity[]> {
    if (names.length === 0) {
      return [];
    }

    return prisma.ingredient.findMany({
      where: { name: { in: names } },
    });
  }

  async create(name: string): Promise<IngredientEntity> {
    return prisma.ingredient.create({
      data: { name },
    });
  }
}
