import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

// Placeholder for real Clerk JWT verification.
// In production, replace this with Clerk's official middleware or JWT verification logic.
export const requireUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const userId = req.header("x-clerk-user-id");

  if (!userId) {
    throw new ApiError(401, "Missing authenticated user.");
  }

  req.userId = userId;
  next();
};

