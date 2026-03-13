import { Router } from "express";
import { adminLoginHandler } from "./admin-auth.controller";

export const adminAuthRouter = Router();

adminAuthRouter.post("/login", adminLoginHandler);

