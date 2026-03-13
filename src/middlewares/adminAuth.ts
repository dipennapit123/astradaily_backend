import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./errorHandler";

export interface AdminJwtPayload {
  adminId: string;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    admin?: AdminJwtPayload;
  }
}

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing admin authorization token.");
  }

  try {
    const token = authHeader.slice("Bearer ".length);
    const payload = jwt.verify(token, env.adminJwtSecret) as AdminJwtPayload;
    req.admin = payload;
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired admin token.");
  }
};

