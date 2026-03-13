import { Router } from "express";
import { adminLoginHandler, adminSetupHandler } from "./admin-auth.controller";

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", adminLoginHandler);
/** One-time: create first admin when no admins exist. Use this after deploying to Railway. */
adminAuthRouter.post("/setup", adminSetupHandler);

