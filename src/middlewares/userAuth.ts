import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import JwksClient from "jwks-rsa";
import { ApiError } from "./errorHandler";
import { env } from "../config/env";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

const getJwksClient = () => {
  const issuer = env.clerkJwtIssuer?.replace(/\/$/, "") ?? "";
  const jwksUri = `${issuer}/.well-known/jwks.json`;
  return JwksClient({ jwksUri, cache: true, rateLimit: true });
};

export const requireUser = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");
    const headerUserId = req.header("x-clerk-user-id");

    if (authHeader?.startsWith("Bearer ") && env.clerkJwtIssuer) {
      const token = authHeader.slice(7);
      const client = getJwksClient();
      const decoded = jwt.decode(token, { complete: true }) as
        | { header: { kid?: string }; payload: { sub?: string } }
        | null;
      if (!decoded?.header?.kid || !decoded?.payload?.sub) {
        throw new ApiError(401, "Invalid token.");
      }
      const key = await client.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();
      jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
        issuer: env.clerkJwtIssuer,
        ...(env.clerkJwtAudience
          ? { audience: env.clerkJwtAudience }
          : {}),
      });
      req.userId = decoded.payload.sub;
      return next();
    }

    if (headerUserId) {
      req.userId = headerUserId;
      return next();
    }

    throw new ApiError(401, "Missing authenticated user.");
  } catch (err) {
    if (err instanceof ApiError) next(err);
    else if (err instanceof jwt.JsonWebTokenError)
      next(new ApiError(401, "Invalid or expired token."));
    else next(err);
  }
};
