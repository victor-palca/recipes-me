import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { signInSchema, signUpSchema } from "../schemas/authSchemas";
import { AuthenticatedRequest } from "../types/http";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  signUp = async (req: Request, res: Response): Promise<void> => {
    const body = signUpSchema.parse(req.body);
    const result = await this.authService.signUp(body);
    res.status(201).json(result);
  };

  signIn = async (req: Request, res: Response): Promise<void> => {
    const body = signInSchema.parse(req.body);
    const result = await this.authService.signIn(body);
    res.status(200).json(result);
  };

  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await this.authService.me(req.auth.sub);
    res.status(200).json({ user });
  };
}
