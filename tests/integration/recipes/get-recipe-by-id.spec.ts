import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { makeRecipePayload } from "../../factories/recipeFactory.js";
import { createUser, authenticateUser } from "../../helpers/auth.js";

describe("GET /recipes/:id", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns 200 with the recipe and ingredients for own recipe", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const createResponse = await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(makeRecipePayload());

    const recipeId = createResponse.body.id;

    const response = await request(app)
      .get(`/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(recipeId);
    expect(Array.isArray(response.body.ingredients)).toBe(true);
  });

  it("returns 401 UNAUTHORIZED when no token is provided", async () => {
    const response = await request(app).get("/recipes/some-id");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 404 NOT_FOUND for a non-existent recipe id", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .get("/recipes/nonexistent-id-00000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });

  it("returns 403 FORBIDDEN when trying to access another user's recipe", async () => {
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
      .get(`/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });
});
