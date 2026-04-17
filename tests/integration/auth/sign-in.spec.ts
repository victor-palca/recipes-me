import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { createUser } from "../../helpers/auth.js";

describe("POST /auth/sign-in", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("returns 200 and accessToken on valid credentials", async () => {
    const payload = makeUserPayload();
    await createUser(payload);

    const response = await request(app)
      .post("/auth/sign-in")
      .send({ email: payload.email, password: payload.password });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe("string");
    expect(response.body.accessToken.length).toBeGreaterThan(0);
  });

  it("returns 401 UNAUTHORIZED for non-existent email", async () => {
    const response = await request(app)
      .post("/auth/sign-in")
      .send({ email: "nobody@test.com", password: "password123" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 UNAUTHORIZED for wrong password", async () => {
    const payload = makeUserPayload();
    await createUser(payload);

    const response = await request(app)
      .post("/auth/sign-in")
      .send({ email: payload.email, password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 VALIDATION_ERROR for malformed email", async () => {
    const response = await request(app)
      .post("/auth/sign-in")
      .send({ email: "not-an-email", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when email is missing", async () => {
    const response = await request(app)
      .post("/auth/sign-in")
      .send({ password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR when password is missing", async () => {
    const response = await request(app)
      .post("/auth/sign-in")
      .send({ email: "user@test.com" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});
