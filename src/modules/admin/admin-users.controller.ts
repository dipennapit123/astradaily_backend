import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../../middlewares/errorHandler";
import {
  getUserActivity,
  getUserAnalytics,
  listUsers,
} from "./admin-users.service";

export const listUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
    const data = await listUsers({ page, pageSize });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getUserAnalyticsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getUserAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getUserActivityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.userId as string;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const data = await getUserActivity(userId, { limit });
    if (!data) {
      throw new ApiError(404, "User not found.");
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
