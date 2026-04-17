import { Router } from "express";
import { makeAuthController } from "../factories/authFactory";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asHandler } from "../types/http";

const authController = makeAuthController();

export const authRoutes = Router();

authRoutes.post("/auth/sign-up", authController.signUp);
authRoutes.post("/auth/sign-in", authController.signIn);
authRoutes.get("/auth/me", authMiddleware, asHandler(authController.me));
