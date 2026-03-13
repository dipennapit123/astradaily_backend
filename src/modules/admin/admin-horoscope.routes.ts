import { Router } from "express";
import { requireAdmin } from "../../middlewares/adminAuth";
import {
  createHoroscopeHandler,
  dashboardStatsHandler,
  deleteHoroscopeHandler,
  generateHoroscopeHandler,
  listHoroscopesHandler,
  publishHoroscopeHandler,
  updateHoroscopeHandler,
} from "./admin-horoscope.controller";

export const adminHoroscopeRouter = Router();

adminHoroscopeRouter.use(requireAdmin);

adminHoroscopeRouter.get("/", listHoroscopesHandler);
adminHoroscopeRouter.post("/", createHoroscopeHandler);
adminHoroscopeRouter.patch("/:id", updateHoroscopeHandler);
adminHoroscopeRouter.delete("/:id", deleteHoroscopeHandler);
adminHoroscopeRouter.patch("/:id/publish", publishHoroscopeHandler);
adminHoroscopeRouter.post("/generate", generateHoroscopeHandler);
adminHoroscopeRouter.get("/dashboard/stats", dashboardStatsHandler);

