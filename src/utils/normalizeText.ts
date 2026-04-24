export function normalizeText(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
