export function calculateTotalPages(total: number, pageSize: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.ceil(total / pageSize);
}
