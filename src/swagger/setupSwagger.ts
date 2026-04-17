import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "../config/env";
import { buildOpenapiDocument } from "./openapi";

export function setupSwagger(app: Express): void {
  if (!env.enableSwagger) {
    return;
  }

  const openapiDocument = buildOpenapiDocument(env.API_PUBLIC_URL);

  app.get("/openapi.json", (_req, res) => {
    res.json(openapiDocument);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiDocument, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    }),
  );
}
