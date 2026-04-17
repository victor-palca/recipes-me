import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { createUser, authenticateUser } from "../../helpers/auth.js";

describe("GET /recipes/search/by-name", () => {
  let token: string;

  beforeEach(async () => {
    await cleanDatabase();

    const userPayload = makeUserPayload();
    await createUser(userPayload);
    token = await authenticateUser(userPayload);

    for (const title of ["Bolo de Chocolate", "Bolo de Cenoura", "Frango Grelhado"]) {
      await request(app)
        .post("/recipes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title,
          preparationMethod: "Prepare and serve.",
          ingredients: [{ ingredientName: "ingredient", quantity: "1", unit: "unit" }],
        });
    }
  });

  it("returns recipes whose title contains the search term", async () => {
    const response = await request(app)
      .get("/recipes/search/by-name?name=bolo")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    const titles = response.body.map((r: { title: string }) => r.title);
    expect(titles).toContain("Bolo de Chocolate");
    expect(titles).toContain("Bolo de Cenoura");
  });

  it("returns results case-insensitively when searching with uppercase", async () => {
    const response = await request(app)
      .get("/recipes/search/by-name?name=BOLO")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it("returns only matching recipe for more specific search term", async () => {
    const response = await request(app)
      .get("/recipes/search/by-name?name=chocolate")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Bolo de Chocolate");
  });

  it("returns empty array when no recipe matches the term", async () => {
    const response = await request(app)
      .get("/recipes/search/by-name?name=xyz-inexistente")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 400 VALIDATION_ERROR when name is empty string", async () => {
    const response = await request(app)
      .get("/recipes/search/by-name?name=")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when name param is absent", async () => {
    const response = await request(app)
      .get("/recipes/search/by-name")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 UNAUTHORIZED when no token is provided", async () => {
    const response = await request(app).get("/recipes/search/by-name?name=bolo");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("only returns recipes belonging to the authenticated user", async () => {
    const otherUserPayload = makeUserPayload();
    await createUser(otherUserPayload);
    const otherToken = await authenticateUser(otherUserPayload);

    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        title: "Bolo de Limao do Outro Usuario",
        preparationMethod: "Prepare.",
        ingredients: [{ ingredientName: "limao", quantity: "2", unit: "units" }],
      });

    const response = await request(app)
      .get("/recipes/search/by-name?name=bolo")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    const titles = response.body.map((r: { title: string }) => r.title);
    expect(titles).not.toContain("Bolo de Limao do Outro Usuario");
  });
});
