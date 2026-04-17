import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { makeRecipePayload } from "../../factories/recipeFactory.js";
import { createUser, authenticateUser } from "../../helpers/auth.js";

describe("PUT /recipes/:id", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("updates the recipe title and returns 200 with updated data", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const createResponse = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(makeRecipePayload());

    const recipeId = createResponse.body.id;

    const response = await request(app)
      .put(`/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Title");
  });

  it("replaces ingredients completely when new list is provided", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const createResponse = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(
        makeRecipePayload({
          ingredients: [{ ingredientName: "old-ingredient", quantity: "100", unit: "g" }],
        }),
      );

    const recipeId = createResponse.body.id;
    const newIngredient = { ingredientName: "new-ingredient", quantity: "50", unit: "ml" };

    const response = await request(app)
      .put(`/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ ingredients: [newIngredient] });

    expect(response.status).toBe(200);
    expect(response.body.ingredients).toHaveLength(1);
    expect(response.body.ingredients[0].ingredientName).toBe(newIngredient.ingredientName);
  });

  it("returns 401 UNAUTHORIZED when no token is provided", async () => {
    const response = await request(app)
      .put("/recipes/some-id")
      .send({ title: "New Title" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 VALIDATION_ERROR when payload has no fields", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const createResponse = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(makeRecipePayload());

    const recipeId = createResponse.body.id;

    const response = await request(app)
      .put(`/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("returns 403 FORBIDDEN when trying to update another user's recipe", async () => {
    const userAPayload = makeUserPayload();
    const userBPayload = makeUserPayload();
    await createUser(userAPayload);
    await createUser(userBPayload);
    const tokenA = await authenticateUser(userAPayload);
    const tokenB = await authenticateUser(userBPayload);

    const createResponse = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(makeRecipePayload());

    const recipeId = createResponse.body.id;

    const response = await request(app)
      .put(`/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Unauthorized Update" });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("returns 404 NOT_FOUND for non-existent recipe id", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .put("/recipes/nonexistent-id-00000")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "No Recipe Here" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });
});
