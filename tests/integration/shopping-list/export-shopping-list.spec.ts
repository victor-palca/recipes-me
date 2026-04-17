import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { makeRecipePayload } from "../../factories/recipeFactory.js";
import { createUser, authenticateUser } from "../../helpers/auth.js";

describe("POST /shopping-list/export", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("exports shopping list text for a single recipe", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const createResponse = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(
        makeRecipePayload({
          ingredients: [{ ingredientName: "farinha", quantity: "500", unit: "g" }],
        }),
      );

    const recipeId = createResponse.body.id;

    const response = await request(app)
      .post("/shopping-list/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ recipeIds: [recipeId] });

    expect(response.status).toBe(200);
    expect(typeof response.body.text).toBe("string");
    expect(response.body.text).toContain("farinha");
  });

  it("exports shopping list for multiple recipes and includes all ingredients", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const recipeAResponse = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(
        makeRecipePayload({
          ingredients: [{ ingredientName: "ovos", quantity: "3", unit: "unidades" }],
        }),
      );

    const recipeBResponse = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(
        makeRecipePayload({
          ingredients: [{ ingredientName: "manteiga", quantity: "100", unit: "g" }],
        }),
      );

    const response = await request(app)
      .post("/shopping-list/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ recipeIds: [recipeAResponse.body.id, recipeBResponse.body.id] });

    expect(response.status).toBe(200);
    expect(response.body.text).toContain("ovos");
    expect(response.body.text).toContain("manteiga");
  });

  it("returns 401 UNAUTHORIZED when no token is provided", async () => {
    const response = await request(app)
      .post("/shopping-list/export")
      .send({ recipeIds: ["some-id"] });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 VALIDATION_ERROR when recipeIds is empty array", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .post("/shopping-list/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ recipeIds: [] });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when recipeIds field is missing", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .post("/shopping-list/export")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns a message indicating no ingredients found for non-owned recipe ids", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .post("/shopping-list/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ recipeIds: ["nonexistent-id-00000"] });

    expect(response.status).toBe(200);
    expect(typeof response.body.text).toBe("string");
    expect(response.body.text.length).toBeGreaterThan(0);
  });
});
