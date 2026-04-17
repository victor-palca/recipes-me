import "dotenv/config";
import { z } from "zod";

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
  })
  .transform(({ ENABLE_SWAGGER, ...rest }) => ({
    ...rest,
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
