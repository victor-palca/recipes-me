import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";
import { verifyAccessToken } from "../utils/jwt";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return next(new AppError("Missing bearer token", 401, ErrorCodes.UNAUTHORIZED));
  }

  const token = authorization.replace("Bearer ", "");
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401, ErrorCodes.UNAUTHORIZED));
  }
}
