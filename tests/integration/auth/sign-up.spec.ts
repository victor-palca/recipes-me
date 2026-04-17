import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase, prisma } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";

describe("POST /auth/sign-up", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("creates a user and returns accessToken and user data on valid payload", async () => {
    const payload = makeUserPayload();

    const response = await request(app).post("/auth/sign-up").send(payload);

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
    expect(typeof response.body.accessToken).toBe("string");
    expect(response.body.user).toMatchObject({
      name: payload.name,
      email: payload.email,
    });
  });

  it("does not return passwordHash or password in the response", async () => {
    const payload = makeUserPayload();

    const response = await request(app).post("/auth/sign-up").send(payload);

    expect(response.body.user.passwordHash).toBeUndefined();
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.passwordHash).toBeUndefined();
  });

  it("stores password as bcrypt hash, not plain text", async () => {
    const payload = makeUserPayload();

    await request(app).post("/auth/sign-up").send(payload);

    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    expect(user).not.toBeNull();
    expect(user!.passwordHash).not.toBe(payload.password);
    expect(user!.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it("returns 409 CONFLICT when email is already registered", async () => {
    const payload = makeUserPayload();

    await request(app).post("/auth/sign-up").send(payload);
    const response = await request(app).post("/auth/sign-up").send(payload);

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("CONFLICT");
  });

  it("returns 400 VALIDATION_ERROR for malformed email", async () => {
    const payload = makeUserPayload({ email: "not-an-email" });

    const response = await request(app).post("/auth/sign-up").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR for password shorter than 8 characters", async () => {
    const payload = makeUserPayload({ password: "short" });

    const response = await request(app).post("/auth/sign-up").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR for empty name", async () => {
    const payload = makeUserPayload({ name: "" });

    const response = await request(app).post("/auth/sign-up").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 VALIDATION_ERROR for empty payload", async () => {
    const response = await request(app).post("/auth/sign-up").send({});

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("normalizes email to lowercase before storing", async () => {
    const payload = makeUserPayload({ email: "UserTest@EXAMPLE.COM" });

    const response = await request(app).post("/auth/sign-up").send(payload);

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("usertest@example.com");
  });
});
