import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";
import { logger } from "../utils/logger";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      code: ErrorCodes.VALIDATION_ERROR,
      details: error.flatten(),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      details: error.details ?? null,
    });
    return;
  }

  logger.error(error);
  res.status(500).json({
    message: "Internal server error",
    code: ErrorCodes.INTERNAL_ERROR,
  });
}
