import { Router } from "express";
import {
  getUserActivityHandler,
  getUserAnalyticsHandler,
  listUsersHandler,
} from "./admin-users.controller";

export const adminUsersRouter = Router();

adminUsersRouter.get("/", listUsersHandler);
adminUsersRouter.get("/analytics", getUserAnalyticsHandler);
adminUsersRouter.get("/:userId/activity", getUserActivityHandler);
