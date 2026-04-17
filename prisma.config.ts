import { loadEnv } from "./src/config/loadEnv";
import { defineConfig } from "prisma/config";

loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
