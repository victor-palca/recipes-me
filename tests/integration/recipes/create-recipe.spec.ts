import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase, prisma } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { makeRecipePayload } from "../../factories/recipeFactory.js";
import { createUser, authenticateUser } from "../../helpers/auth.js";

describe("POST /recipes", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("creates a recipe with ingredients and returns 201 when authenticated", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);
    const recipePayload = makeRecipePayload();

    const response = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(recipePayload);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(recipePayload.title);
    expect(response.body.preparationMethod).toBe(recipePayload.preparationMethod);
    expect(Array.isArray(response.body.ingredients)).toBe(true);
    expect(response.body.ingredients).toHaveLength(1);
  });

  it("associates the recipe with the authenticated user", async () => {
    const userPayload = makeUserPayload();
    const signUpResponse = await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(makeRecipePayload());

    expect(response.status).toBe(201);
    expect(response.body.userId).toBe(signUpResponse.user.id);
  });

  it("returns 401 UNAUTHORIZED when no token is provided", async () => {
    const response = await request(app).post("/recipes").send(makeRecipePayload());

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 VALIDATION_ERROR when title is missing", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);
    const { title: _title, ...withoutTitle } = makeRecipePayload();

    const response = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(withoutTitle);

    expect(response.status).toBe(400);
  });

  it("returns 400 VALIDATION_ERROR when preparationMethod is missing", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);
    const { preparationMethod: _pm, ...withoutPm } = makeRecipePayload();

    const response = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(withoutPm);

    expect(response.status).toBe(400);
  });

  it("returns 400 VALIDATION_ERROR when ingredients array is empty", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(makeRecipePayload({ ingredients: [] }));

    expect(response.status).toBe(400);
  });

  it("returns 400 VALIDATION_ERROR when an ingredient is missing quantity", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(
        makeRecipePayload({
          ingredients: [{ ingredientName: "salt", quantity: "", unit: "g" }],
        }),
      );

    expect(response.status).toBe(400);
  });

  it("deduplicates ingredients with the same name sent in the same payload", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);
    const ingredientName = "duplicate-ingredient";

    const response = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(
        makeRecipePayload({
          ingredients: [
            { ingredientName, quantity: "100", unit: "g" },
            { ingredientName, quantity: "200", unit: "g" },
          ],
        }),
      );

    expect(response.status).toBe(201);
    expect(response.body.ingredients).toHaveLength(1);

    const count = await prisma.ingredient.count({ where: { name: ingredientName } });
    expect(count).toBe(1);
  });

  it("reuses an existing ingredient instead of creating a duplicate", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);
    const ingredientName = "shared-ingredient";

    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(makeRecipePayload({ ingredients: [{ ingredientName, quantity: "100", unit: "g" }] }));

    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(makeRecipePayload({ ingredients: [{ ingredientName, quantity: "200", unit: "kg" }] }));

    const count = await prisma.ingredient.count({ where: { name: ingredientName } });
    expect(count).toBe(1);
  });
});
