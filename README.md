# Recipies Me Backend

API REST para catalogo de receitas com autenticacao JWT, CRUD de receitas, filtro por ingredientes e exportacao de lista de compras.

## Stack

- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Zod para validacao
- Docker Compose para subir o banco

## Rodando localmente

1. Copie variaveis:
   - `cp .env.example .env`
   - Opcional: `.env.local` ou `.env.development` para overrides (ver comentarios no `.env.example`).
   - Producao remota para teste local: `.env.production` com `DATABASE_URL` (gitignored); em deploy use as variaveis do provedor.
2. Suba o banco:
   - `docker compose up -d`
3. Gere client Prisma e aplique migration:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
4. Rode a API:
   - `npm run dev`

## Endpoints

### Auth

- `POST /auth/sign-up`
- `POST /auth/sign-in`
- `GET /auth/me` (Bearer token)

Exemplo sign up:

```json
{
  "name": "Victor",
  "email": "victor@example.com",
  "password": "12345678"
}
```

### Receitas (protegido)

- `POST /recipes`
- `GET /recipes` (suporta `page` e `pageSize`)
- `GET /recipes/search/by-name?name=bolo`
- `GET /recipes/:id`
- `PUT /recipes/:id`
- `DELETE /recipes/:id`
- `GET /recipes/filter/by-ingredients?ingredients=tomate,cebola`

Exemplo criar receita:

```json
{
  "title": "Bolo simples",
  "imageUrl": "https://example.com/bolo.jpg",
  "videoUrl": "https://youtube.com/watch?v=abc",
  "preparationMethod": "Misture tudo e asse por 40 minutos.",
  "ingredients": [
    {
      "ingredientName": "Farinha de trigo",
      "quantity": "2",
      "unit": "xicaras"
    },
    {
      "ingredientName": "Ovos",
      "quantity": "3",
      "unit": "unidades"
    }
  ]
}
```

Exemplo busca por nome:

`GET /recipes/search/by-name?name=bolo`

Retorna lista de receitas no mesmo formato do `GET /recipes`.

Exemplo listagem paginada:

`GET /recipes?page=1&pageSize=6`

Resposta:

```json
{
  "data": [
    {
      "id": "recipe-id",
      "title": "Bolo simples",
      "imageUrl": "https://example.com/image.jpg",
      "videoUrl": "https://youtube.com/watch?v=123",
      "preparationMethod": "Misture tudo e asse.",
      "createdAt": "2026-04-17T10:00:00.000Z",
      "updatedAt": "2026-04-17T10:00:00.000Z",
      "userId": "user-id"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 6,
    "total": 32,
    "totalPages": 6,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Testes automatizados

A suite usa **Vitest** + **Supertest** com um banco PostgreSQL exclusivo para testes (porta `5433`).

### Pre-requisitos

- Docker instalado e rodando

### 1. Subir o banco de teste

```bash
docker compose -f docker-compose.test.yml up -d
```

### 2. Criar o arquivo .env.test

Crie um arquivo `.env.test` na raiz com o seguinte conteudo:

```env
NODE_ENV=test
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/recipies_me_test"
JWT_SECRET="test-secret-key-for-tests-only"
JWT_EXPIRES_IN="1h"
PORT=3001
```

> As migrations sao aplicadas automaticamente no banco de teste antes dos testes rodarem.

### 3. Executar os testes

```bash
# Rodar a suite completa uma vez
npm run test

# Rodar em modo watch (re-executa ao salvar)
npm run test:watch

# Rodar com relatorio de cobertura
npm run test:coverage
```

### Estrutura dos testes

```
tests/
  integration/
    auth/              # sign-up, sign-in, me
    recipes/           # create, list, get-by-id, update, delete, filter, search
    shopping-list/     # export
  helpers/
    database.ts        # cleanDatabase() - limpa o banco entre os testes
    auth.ts            # createUser(), authenticateUser()
  factories/
    userFactory.ts     # makeUserPayload()
    recipeFactory.ts   # makeRecipePayload()
  setup/
    globalSetup.ts     # executa migrations antes da suite
    setupFiles.ts      # carrega .env.test em cada worker
```

---

### Lista de compras (protegido)

- `POST /shopping-list/export`

Exemplo:

```json
{
  "recipeIds": ["cmaaa111", "cmaaa222"]
}
```

Resposta:

```json
{
  "text": "Lista de compras\n- [Bolo simples] 2 xicaras farinha de trigo"
}
```
