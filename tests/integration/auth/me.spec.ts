import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { createUser, authenticateUser } from "../../helpers/auth.js";

describe("GET /auth/me", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns 200 and authenticated user data on valid token", async () => {
    const payload = makeUserPayload();
    await createUser(payload);
    const token = await authenticateUser(payload);

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      email: payload.email,
      name: payload.name,
    });
    expect(response.body.user.id).toBeDefined();
    expect(response.body.user.createdAt).toBeDefined();
    expect(response.body.user.updatedAt).toBeDefined();
  });

  it("does not return passwordHash in the user response", async () => {
    const payload = makeUserPayload();
    await createUser(payload);
    const token = await authenticateUser(payload);

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.user.password).toBeUndefined();
  });

  it("returns 401 UNAUTHORIZED when Authorization header is missing", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 UNAUTHORIZED for a random string token", async () => {
    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer this-is-not-a-valid-token");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 UNAUTHORIZED when Bearer prefix is missing", async () => {
    const payload = makeUserPayload();
    await createUser(payload);
    const token = await authenticateUser(payload);

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", token);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });
});
