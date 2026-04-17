import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app.js";
import { cleanDatabase } from "../../helpers/database.js";
import { makeUserPayload } from "../../factories/userFactory.js";
import { createUser, authenticateUser } from "../../helpers/auth.js";

describe("GET /recipes/filter/by-ingredients", () => {
  let token: string;

  beforeEach(async () => {
    await cleanDatabase();

    const userPayload = makeUserPayload();
    await createUser(userPayload);
    token = await authenticateUser(userPayload);

    // Recipe A: frango + alho
    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Frango com Alho",
        preparationMethod: "Grelhar o frango com alho.",
        ingredients: [
          { ingredientName: "frango", quantity: "500", unit: "g" },
          { ingredientName: "alho", quantity: "3", unit: "dentes" },
        ],
      });

    // Recipe B: frango + tomate
    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Frango com Tomate",
        preparationMethod: "Cozinhar o frango com tomate.",
        ingredients: [
          { ingredientName: "frango", quantity: "400", unit: "g" },
          { ingredientName: "tomate", quantity: "2", unit: "unidades" },
        ],
      });

    // Recipe C: arroz + alho
    await request(app)
      .post("/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Arroz com Alho",
        preparationMethod: "Cozinhar o arroz com alho.",
        ingredients: [
          { ingredientName: "arroz", quantity: "200", unit: "g" },
          { ingredientName: "alho", quantity: "2", unit: "dentes" },
        ],
      });
  });

  it("returns recipes that contain the given single ingredient", async () => {
    const response = await request(app)
      .get("/recipes/filter/by-ingredients?ingredients=frango")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    const titles = response.body.data.map((r: { title: string }) => r.title);
    expect(titles).toContain("Frango com Alho");
    expect(titles).toContain("Frango com Tomate");
    expect(titles).not.toContain("Arroz com Alho");
  });

  it("applies AND logic returning only recipes with all given ingredients", async () => {
    const response = await request(app)
      .get("/recipes/filter/by-ingredients?ingredients=frango,alho")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    const titles = response.body.data.map((r: { title: string }) => r.title);
    expect(titles).toContain("Frango com Alho");
    expect(titles).not.toContain("Frango com Tomate");
    expect(titles).not.toContain("Arroz com Alho");
  });

  it("returns only recipes containing alho", async () => {
    const response = await request(app)
      .get("/recipes/filter/by-ingredients?ingredients=alho")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    const titles = response.body.data.map((r: { title: string }) => r.title);
    expect(titles).toContain("Frango com Alho");
    expect(titles).toContain("Arroz com Alho");
    expect(titles).not.toContain("Frango com Tomate");
  });

  it("returns empty data when no recipe matches the given ingredient", async () => {
    const response = await request(app)
      .get("/recipes/filter/by-ingredients?ingredients=pepino")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it("returns 401 UNAUTHORIZED when no token is provided", async () => {
    const response = await request(app).get(
      "/recipes/filter/by-ingredients?ingredients=frango",
    );

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });

  it("normalizes ingredient name casing (case-insensitive filter)", async () => {
    const response = await request(app)
      .get("/recipes/filter/by-ingredients?ingredients=Frango")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    const titles = response.body.data.map((r: { title: string }) => r.title);
    expect(titles).toContain("Frango com Alho");
    expect(titles).toContain("Frango com Tomate");
  });

  it("returns all user recipes when no ingredients filter is provided", async () => {
    const response = await request(app)
      .get("/recipes/filter/by-ingredients")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
  });
});
