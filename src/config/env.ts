import { loadEnv } from "./loadEnv";
import { z } from "zod";

loadEnv();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default("1d"),
    DATABASE_URL: z.string().url(),
    /** Base URL pública da API para o Swagger (Try it out). Opcional. */
    API_PUBLIC_URL: z.string().url().optional(),
    /**
     * `true` / `false`. Em `development` o Swagger fica sempre ativo.
     * Nos demais ambientes: omitido = ativo exceto em `production`.
     */
    ENABLE_SWAGGER: z.enum(["true", "false"]).optional(),
    /** Origens CORS separadas por vírgula. Omitido = apenas http://localhost:3001 */
    CORS_ORIGINS: z.string().optional(),
  })
  .transform(({ ENABLE_SWAGGER, CORS_ORIGINS, ...rest }) => ({
    ...rest,
    corsOrigins: (() => {
      const list =
        CORS_ORIGINS?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) ?? [];
      return list.length > 0 ? list : ["http://localhost:3001"];
    })(),
    enableSwagger:
      rest.NODE_ENV === "development"
        ? true
        : ENABLE_SWAGGER === "true"
          ? true
          : ENABLE_SWAGGER === "false"
            ? false
            : rest.NODE_ENV !== "production",
  }));

export const env = envSchema.parse(process.env);
