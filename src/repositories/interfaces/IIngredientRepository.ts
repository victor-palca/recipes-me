import { IngredientEntity } from "../../entities/ingredient";

export interface IIngredientRepository {
  findByNormalizedName(name: string): Promise<IngredientEntity | null>;
  findManyByNormalizedNames(names: string[]): Promise<IngredientEntity[]>;
  create(name: string): Promise<IngredientEntity>;
}
