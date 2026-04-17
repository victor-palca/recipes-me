let counter = 0;

export function makeUserPayload(
  overrides: Partial<{ name: string; email: string; password: string }> = {},
) {
  counter++;
  return {
    name: `Test User ${counter}`,
    email: `user${counter}@test.com`,
    password: "password123",
    ...overrides,
  };
}
