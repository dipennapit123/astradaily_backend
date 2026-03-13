import { Router } from "express";
import { requireAdmin } from "../../middlewares/adminAuth";
import {
  getUserActivityHandler,
  getUserAnalyticsHandler,
  listUsersHandler,
} from "./admin-users.controller";

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAdmin);

adminUsersRouter.get("/", listUsersHandler);
adminUsersRouter.get("/analytics", getUserAnalyticsHandler);
adminUsersRouter.get("/:userId/activity", getUserActivityHandler);
