import { NextFunction, Request, RequestHandler, Response } from "express";
import { JwtPayload } from "../utils/jwt";

export type AuthenticatedRequest = Request & { auth: JwtPayload };

export type AuthenticatedRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

export function asHandler(handler: AuthenticatedRequestHandler): RequestHandler {
  return handler as unknown as RequestHandler;
}
