import type { Request, Response } from "express";
import { ApiError } from "../../middlewares/errorHandler";
import { prisma } from "../../utils/prisma";
import {
  getHoroscopeHistoryForZodiac,
  getLatestHoroscopeForZodiac,
} from "./horoscope.service";

export const getTodayHoroscopeHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, "Unauthenticated.");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: req.userId },
  });

  if (!user?.zodiacSign) {
    throw new ApiError(400, "User zodiac sign not set.");
  }

  const latest = await getLatestHoroscopeForZodiac(user.zodiacSign);

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

  const user = await prisma.user.findUnique({
    where: { clerkUserId: req.userId },
  });

  if (!user?.zodiacSign) {
    throw new ApiError(400, "User zodiac sign not set.");
  }

  const history = await getHoroscopeHistoryForZodiac(user.zodiacSign);
  res.json({ success: true, data: history });
};

