import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../../middlewares/errorHandler";
import { getCurrentUser, recordActivity, syncClerkUser, updateUserZodiac } from "./user.service";

const syncSchema = z.object({
  clerkUserId: z.string(),
  email: z.string().email(),
  fullName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
});

const zodiacSchema = z.object({
  zodiacSign: z.enum([
    "ARIES",
    "TAURUS",
    "GEMINI",
    "CANCER",
    "LEO",
    "VIRGO",
    "LIBRA",
    "SCORPIO",
    "SAGITTARIUS",
    "CAPRICORN",
    "AQUARIUS",
    "PISCES",
  ]),
});

const activitySchema = z.object({
  action: z.enum(["APP_OPEN", "HOROSCOPE_VIEW", "ZODIAC_SELECTED", "SETTINGS_VIEW"]),
  sessionId: z.string().optional(),
  timezone: z.string().optional(),
  platform: z.string().optional(),
  appVersion: z.string().optional(),
});

export const syncClerkUserHandler = async (req: Request, res: Response) => {
  const parsed = syncSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid user payload.");
  }

  const user = await syncClerkUser(parsed.data);

  res.json({ success: true, data: user });
};

export const getMeHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, "Unauthenticated.");
  }

  const user = await getCurrentUser(req.userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.json({ success: true, data: user });
};

export const updateZodiacHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, "Unauthenticated.");
  }

  const parsed = zodiacSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid zodiac payload.");
  }

  const updated = await updateUserZodiac(req.userId, parsed.data.zodiacSign);
  res.json({ success: true, data: updated });
};

export const recordActivityHandler = async (req: Request, res: Response) => {
  if (!req.userId) {
    throw new ApiError(401, "Unauthenticated.");
  }

  const parsed = activitySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid activity payload.");
  }

  const activity = await recordActivity(req.userId, parsed.data.action, {
    sessionId: parsed.data.sessionId,
    timezone: parsed.data.timezone,
    platform: parsed.data.platform,
    appVersion: parsed.data.appVersion,
  });
  res.json({ success: true, data: activity });
};

