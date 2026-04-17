import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup/setupFiles.ts"],
    globalSetup: ["./tests/setup/globalSetup.ts"],
    testTimeout: 30000,
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
    },
  },
});
