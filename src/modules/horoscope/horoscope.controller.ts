import type { Request, Response } from "express";
import { ApiError } from "../../middlewares/errorHandler";
import type { ZodiacSign } from "../../types";
import { getCurrentUser } from "../user/user.service";
import {
  getHoroscopeHistoryForZodiac,
  getLatestHoroscopeForZodiac,
} from "./horoscope.service";

export const getTodayHoroscopeHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, "Unauthenticated.");
  }

  const user = await getCurrentUser(req.userId);
  const zodiacSign = user && (user as { zodiacSign?: string }).zodiacSign;

  if (!zodiacSign) {
    throw new ApiError(400, "User zodiac sign not set.");
  }

  const latest = await getLatestHoroscopeForZodiac(zodiacSign as ZodiacSign);

  if (!latest) {
    return res.json({
      success: true,
      data: null,
      message: "No horoscope available yet.",
    });
  }

  res.json({ success: true, data: latest });
};

export const getHistoryHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, "Unauthenticated.");
  }

  const user = await getCurrentUser(req.userId);
  const zodiacSign = user && (user as { zodiacSign?: string }).zodiacSign;

  if (!zodiacSign) {
    throw new ApiError(400, "User zodiac sign not set.");
  }

  const history = await getHoroscopeHistoryForZodiac(zodiacSign as ZodiacSign);
  res.json({ success: true, data: history });
};

