import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { makeRecipePayload } from "../../factories/recipeFactory.js";
import { createUser, authenticateUser } from "../../helpers/auth.js";

describe("GET /recipes", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns 200 with { data, meta } structure when authenticated", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .get("/recipes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta).toBeDefined();
    expect(typeof response.body.meta.total).toBe("number");
    expect(typeof response.body.meta.page).toBe("number");
    expect(typeof response.body.meta.pageSize).toBe("number");
    expect(typeof response.body.meta.totalPages).toBe("number");
    expect(typeof response.body.meta.hasNextPage).toBe("boolean");
    expect(typeof response.body.meta.hasPreviousPage).toBe("boolean");
  });

  it("returns 401 UNAUTHORIZED when no token is provided", async () => {
    const response = await request(app).get("/recipes");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns empty data with total 0 when user has no recipes", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .get("/recipes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta.total).toBe(0);
  });

  it("paginates correctly - page 1 with pageSize 3 returns 3 items and hasNextPage true", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/recipes")
        .set("Authorization", `Bearer ${token}`)
        .send(makeRecipePayload());
    }

    const response = await request(app)
      .get("/recipes?page=1&pageSize=3")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.meta.hasNextPage).toBe(true);
    expect(response.body.meta.hasPreviousPage).toBe(false);
    expect(response.body.meta.total).toBe(5);
  });

  it("paginates correctly - page 2 with pageSize 3 returns 2 items", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/recipes")
        .set("Authorization", `Bearer ${token}`)
        .send(makeRecipePayload());
    }

    const response = await request(app)
      .get("/recipes?page=2&pageSize=3")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta.hasPreviousPage).toBe(true);
    expect(response.body.meta.hasNextPage).toBe(false);
  });

  it("returns 400 VALIDATION_ERROR for page=0", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .get("/recipes?page=0")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("returns 400 VALIDATION_ERROR for pageSize above 100", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    const response = await request(app)
      .get("/recipes?pageSize=101")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("only returns recipes belonging to the authenticated user", async () => {
    const userAPayload = makeUserPayload();
    const userBPayload = makeUserPayload();
    await createUser(userAPayload);
    await createUser(userBPayload);
    const tokenA = await authenticateUser(userAPayload);
    const tokenB = await authenticateUser(userBPayload);

    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(makeRecipePayload({ title: "Recipe of User A" }));

    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${tokenB}`)
      .send(makeRecipePayload({ title: "Recipe of User B" }));

    const response = await request(app)
      .get("/recipes")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe("Recipe of User A");
  });

  it("returns empty data when page exceeds totalPages", async () => {
    const userPayload = makeUserPayload();
    await createUser(userPayload);
    const token = await authenticateUser(userPayload);

    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send(makeRecipePayload());

    const response = await request(app)
      .get("/recipes?page=999&pageSize=6")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta.total).toBe(1);
  });
});
