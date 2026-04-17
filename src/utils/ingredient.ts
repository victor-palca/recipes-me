export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
