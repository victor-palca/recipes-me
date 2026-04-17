import request from "supertest";
import { app } from "../../src/app.js";

interface UserCredentials {
  email: string;
  password: string;
  name?: string;
}

export async function createUser(credentials: UserCredentials) {
  const response = await request(app)
    .post("/auth/sign-up")
    .send({
      name: credentials.name ?? "Test User",
      email: credentials.email,
      password: credentials.password,
    });
  return response.body;
}

export async function authenticateUser(credentials: UserCredentials): Promise<string> {
  const response = await request(app).post("/auth/sign-in").send({
    email: credentials.email,
    password: credentials.password,
  });
  return response.body.accessToken;
}
