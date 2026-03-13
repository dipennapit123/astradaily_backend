import { Router } from "express";
import { requireUser } from "../../middlewares/userAuth";
import {
  getHistoryHandler,
  getTodayHoroscopeHandler,
} from "./horoscope.controller";

export const horoscopeRouter = Router();

horoscopeRouter.get("/today", requireUser, getTodayHoroscopeHandler);
horoscopeRouter.get("/history", requireUser, getHistoryHandler);

