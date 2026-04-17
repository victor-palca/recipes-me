/**
 * OpenAPI 3.0 — mantido alinhado a controllers, rotas e schemas Zod.
 * Use `buildOpenapiDocument` para definir `servers` (URL pública opcional).
 */
export const openapiBase = {
  openapi: "3.0.3",
  info: {
    title: "Recipies Me API",
    description:
      "API REST para autenticação, receitas e exportação de lista de compras.",
    version: "1.0.0",
  },
  tags: [
    { name: "Health", description: "Disponibilidade do serviço" },
    { name: "Auth", description: "Cadastro, login e sessão" },
    { name: "Recipes", description: "CRUD e busca de receitas (autenticado)" },
    {
      name: "Shopping list",
      description: "Exportação de lista a partir de receitas (autenticado)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        required: ["id", "name", "email", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", description: "Identificador CUID" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["accessToken", "user"],
        properties: {
          accessToken: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      SignUpRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8, maxLength: 72 },
        },
      },
      SignInRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
      },
      MeResponse: {
        type: "object",
        required: ["user"],
        properties: {
          user: { $ref: "#/components/schemas/User" },
        },
      },
      RecipeIngredientInput: {
        type: "object",
        required: ["ingredientName", "quantity", "unit"],
        properties: {
          ingredientName: { type: "string", minLength: 1 },
          quantity: { type: "string", minLength: 1 },
          unit: { type: "string", minLength: 1 },
        },
      },
      RecipeIngredient: {
        type: "object",
        required: [
          "ingredientId",
          "ingredientName",
          "quantity",
          "unit",
        ],
        properties: {
          ingredientId: { type: "string" },
          ingredientName: { type: "string" },
          quantity: { type: "string" },
          unit: { type: "string" },
        },
      },
      Recipe: {
        type: "object",
        required: [
          "id",
          "title",
          "preparationMethod",
          "userId",
          "createdAt",
          "updatedAt",
          "ingredients",
        ],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          imageUrl: { type: "string", format: "uri", nullable: true },
          videoUrl: { type: "string", format: "uri", nullable: true },
          preparationMethod: { type: "string" },
          userId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          ingredients: {
            type: "array",
            items: { $ref: "#/components/schemas/RecipeIngredient" },
          },
        },
      },
      CreateRecipeRequest: {
        type: "object",
        required: ["title", "preparationMethod", "ingredients"],
        properties: {
          title: { type: "string", minLength: 1 },
          imageUrl: { type: "string", format: "uri" },
          videoUrl: { type: "string", format: "uri" },
          preparationMethod: { type: "string", minLength: 1 },
          ingredients: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/RecipeIngredientInput" },
          },
        },
      },
      UpdateRecipeRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          title: { type: "string", minLength: 1 },
          imageUrl: { type: "string", format: "uri", nullable: true },
          videoUrl: { type: "string", format: "uri", nullable: true },
          preparationMethod: { type: "string", minLength: 1 },
          ingredients: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/RecipeIngredientInput" },
          },
        },
        description:
          "Pelo menos um campo deve ser enviado (validação no servidor).",
      },
      PaginatedRecipesMeta: {
        type: "object",
        required: [
          "page",
          "pageSize",
          "total",
          "totalPages",
          "hasNextPage",
          "hasPreviousPage",
        ],
        properties: {
          page: { type: "integer", minimum: 1 },
          pageSize: { type: "integer", minimum: 1, maximum: 100 },
          total: { type: "integer", minimum: 0 },
          totalPages: { type: "integer", minimum: 0 },
          hasNextPage: { type: "boolean" },
          hasPreviousPage: { type: "boolean" },
        },
      },
      PaginatedRecipesResponse: {
        type: "object",
        required: ["data", "meta"],
        properties: {
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Recipe" },
          },
          meta: { $ref: "#/components/schemas/PaginatedRecipesMeta" },
        },
      },
      ShoppingListExportRequest: {
        type: "object",
        required: ["recipeIds"],
        properties: {
          recipeIds: {
            type: "array",
            minItems: 1,
            items: { type: "string", minLength: 1 },
          },
        },
      },
      ShoppingListExportResponse: {
        type: "object",
        required: ["text"],
        properties: {
          text: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Serviço disponível",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/sign-up": {
      post: {
        tags: ["Auth"],
        summary: "Cadastro de usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignUpRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { description: "Payload inválido" },
          "409": { description: "E-mail já em uso" },
        },
      },
    },
    "/auth/sign-in": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignInRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { description: "Payload inválido" },
          "401": { description: "Credenciais inválidas" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Usuário atual",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Perfil",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" },
              },
            },
          },
          "401": { description: "Não autenticado" },
          "404": { description: "Usuário não encontrado" },
        },
      },
    },
    "/recipes": {
      get: {
        tags: ["Recipes"],
        summary: "Listar receitas (paginação e filtro por ingredientes)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ingredients",
            in: "query",
            description:
              "Filtro por nomes de ingredientes (repetir o parâmetro ou valores separados por vírgula no mesmo campo).",
            schema: { type: "array", items: { type: "string", minLength: 1 } },
            style: "form",
            explode: true,
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 6 },
          },
        ],
        responses: {
          "200": {
            description: "Lista paginada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedRecipesResponse",
                },
              },
            },
          },
          "401": { description: "Não autenticado" },
        },
      },
      post: {
        tags: ["Recipes"],
        summary: "Criar receita",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRecipeRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Receita criada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Recipe" },
              },
            },
          },
          "400": { description: "Payload inválido" },
          "401": { description: "Não autenticado" },
        },
      },
    },
    "/recipes/search/by-name": {
      get: {
        tags: ["Recipes"],
        summary: "Buscar receitas por nome",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "name",
            in: "query",
            required: true,
            schema: { type: "string", minLength: 1 },
          },
        ],
        responses: {
          "200": {
            description: "Lista de receitas",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Recipe" },
                },
              },
            },
          },
          "400": { description: "Query inválida" },
          "401": { description: "Não autenticado" },
        },
      },
    },
    "/recipes/filter/by-ingredients": {
      get: {
        tags: ["Recipes"],
        summary: "Filtrar receitas por ingredientes",
        description: "Mesmo comportamento de GET /recipes (lista paginada).",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "ingredients",
            in: "query",
            schema: { type: "array", items: { type: "string", minLength: 1 } },
            style: "form",
            explode: true,
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 6 },
          },
        ],
        responses: {
          "200": {
            description: "Lista paginada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedRecipesResponse",
                },
              },
            },
          },
          "401": { description: "Não autenticado" },
        },
      },
    },
    "/recipes/{id}": {
      get: {
        tags: ["Recipes"],
        summary: "Obter receita por ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1 },
          },
        ],
        responses: {
          "200": {
            description: "Receita",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Recipe" },
              },
            },
          },
          "401": { description: "Não autenticado" },
          "404": { description: "Não encontrada" },
        },
      },
      put: {
        tags: ["Recipes"],
        summary: "Atualizar receita",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRecipeRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Receita atualizada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Recipe" },
              },
            },
          },
          "400": { description: "Payload inválido" },
          "401": { description: "Não autenticado" },
          "404": { description: "Não encontrada" },
        },
      },
      delete: {
        tags: ["Recipes"],
        summary: "Remover receita",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1 },
          },
        ],
        responses: {
          "204": { description: "Removida" },
          "401": { description: "Não autenticado" },
          "404": { description: "Não encontrada" },
        },
      },
    },
    "/shopping-list/export": {
      post: {
        tags: ["Shopping list"],
        summary: "Exportar lista de compras em texto",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ShoppingListExportRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Texto agregado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ShoppingListExportResponse",
                },
              },
            },
          },
          "400": { description: "Payload inválido" },
          "401": { description: "Não autenticado" },
        },
      },
    },
  },
} as const;

export type OpenapiDocument = typeof openapiBase & {
  servers: { url: string; description: string }[];
};

export function buildOpenapiDocument(
  apiPublicUrl?: string,
): OpenapiDocument {
  const trimmed = apiPublicUrl?.trim().replace(/\/$/, "");
  return {
    ...openapiBase,
    servers: trimmed
      ? [{ url: trimmed, description: "Definida em API_PUBLIC_URL" }]
      : [{ url: "/", description: "Mesmo host da aplicação" }],
  };
}
