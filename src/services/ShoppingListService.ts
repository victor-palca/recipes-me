import { IRecipeIngredientRepository } from "../repositories/interfaces/IRecipeIngredientRepository";

export class ShoppingListService {
  constructor(
    private readonly recipeIngredientRepository: IRecipeIngredientRepository,
  ) {}

  async exportText(userId: string, recipeIds: string[]): Promise<string> {
    const lines = await this.recipeIngredientRepository.listShoppingLinesByRecipeIds(
      userId,
      recipeIds,
    );

    if (lines.length === 0) {
      return "Nenhum ingrediente encontrado para as receitas selecionadas.";
    }

    return [
      "Lista de compras",
      ...lines.map(
        (line) =>
          `- [${line.recipeTitle}] ${line.quantity} ${line.unit} ${line.ingredientName}`,
      ),
    ].join("\n");
  }
}
