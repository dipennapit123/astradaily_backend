import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../../middlewares/errorHandler";
import {
  createHoroscope,
  deleteHoroscope,
  generateHoroscope,
  getDashboardStats,
  listHoroscopes,
  publishHoroscope,
  updateHoroscope,
} from "./admin-horoscope.service";

const baseHoroscopeSchema = z.object({
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
  date: z.string(),
  title: z.string(),
  summary: z.string(),
  wealthText: z.string(),
  loveText: z.string(),
  healthText: z.string(),
  wealthConfidence: z.number().int().min(0).max(100),
  loveConfidence: z.number().int().min(0).max(100),
  healthConfidence: z.number().int().min(0).max(100),
  wealthActionLabel: z.string().optional(),
  loveActionLabel: z.string().optional(),
  healthActionLabel: z.string().optional(),
  weeklyOutlook: z.string().optional(),
  isPublished: z.boolean().optional(),
});

const generateSchema = z
  .object({
    zodiacSign: z
      .enum([
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
      ])
      .optional(),
    allZodiacs: z.union([z.boolean(), z.string()]).optional(),
    date: z.string().optional(),
    tone: z
      .enum(["mystical", "modern", "friendly", "premium"])
      .optional(),
    notes: z.string().optional(),
  })
  .partial()
  .passthrough();

export const listHoroscopesHandler = async (req: Request, res: Response) => {
  const page =
    typeof req.query.page === "string" ? parseInt(req.query.page, 10) || 1 : 1;
  const pageSize = 12;
  const dateStr = req.query.date as string | undefined;

  const data = await listHoroscopes({
    zodiacSign: req.query.zodiacSign as any,
    isPublished:
      typeof req.query.isPublished === "string"
        ? req.query.isPublished === "true"
        : undefined,
    search: req.query.search as string | undefined,
    date: dateStr ? new Date(dateStr) : undefined,
    page,
    pageSize,
  });
  res.json({ success: true, data });
};

export const createHoroscopeHandler = async (req: Request, res: Response) => {
  const parsed = baseHoroscopeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid horoscope payload.");
  }

  const adminId = req.admin?.adminId;
  const data = parsed.data;

  const created = await createHoroscope({
    zodiacSign: data.zodiacSign as any,
    date: new Date(data.date),
    title: data.title,
    summary: data.summary,
    wealthText: data.wealthText,
    loveText: data.loveText,
    healthText: data.healthText,
    wealthConfidence: data.wealthConfidence,
    loveConfidence: data.loveConfidence,
    healthConfidence: data.healthConfidence,
    wealthActionLabel: data.wealthActionLabel,
    loveActionLabel: data.loveActionLabel,
    healthActionLabel: data.healthActionLabel,
    weeklyOutlook: data.weeklyOutlook,
    isPublished: data.isPublished ?? false,
    createdBy: adminId ? { connect: { id: adminId } } : undefined,
    updatedBy: adminId ? { connect: { id: adminId } } : undefined,
  });

  res.status(201).json({ success: true, data: created });
};

export const updateHoroscopeHandler = async (req: Request, res: Response) => {
  const parsed = baseHoroscopeSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid horoscope payload.");
  }

  const { id } = req.params;
  const adminId = req.admin?.adminId;

  const payload = parsed.data;
  const updated = await updateHoroscope(id, {
    ...payload,
    date: payload.date ? new Date(payload.date) : undefined,
    zodiacSign: payload.zodiacSign as any,
    updatedBy: adminId ? { connect: { id: adminId } } : undefined,
  });

  res.json({ success: true, data: updated });
};

export const deleteHoroscopeHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteHoroscope(id);
  res.status(204).send();
};

export const publishHoroscopeHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const isPublished =
    typeof req.body.isPublished === "boolean"
      ? req.body.isPublished
      : req.body.isPublished === "true";

  const updated = await publishHoroscope(id, isPublished);
  res.json({ success: true, data: updated });
};

export const generateHoroscopeHandler = async (
  req: Request,
  res: Response,
) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) {
    // Log detailed validation error but do not block generation for admins
    // eslint-disable-next-line no-console
    console.error("[generateHoroscope] Invalid payload", parsed.error);
  }

  const body = (parsed.success ? parsed.data : req.body) as any;

  const zodiacSign = body.zodiacSign as
    | (typeof generateSchema extends any ? string : never)
    | undefined;
  const allZodiacsRaw = body.allZodiacs as boolean | string | undefined;
  const allZodiacs =
    typeof allZodiacsRaw === "boolean"
      ? allZodiacsRaw
      : allZodiacsRaw === "true" || allZodiacsRaw === "on";
  const date = body.date as string | undefined;
  // Tone is now driven by the backend prompt; default to premium if not provided
  const tone = (body.tone as
    | "mystical"
    | "modern"
    | "friendly"
    | "premium"
    | undefined) ?? "premium";
  const notes = body.notes as string | undefined;
  const targetZodiacs =
    allZodiacs || !zodiacSign
      ? ([
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
        ] as const)
      : [zodiacSign];

  // Generate one sign at a time so each request is distinct and content varies per sign
  const generated: Array<{ zodiacSign: typeof targetZodiacs[number]; [key: string]: any }> = [];
  for (const z of targetZodiacs) {
    const content = await generateHoroscope({
      zodiacSign: z as any,
      date: new Date(date),
      tone,
      notes,
    });
    generated.push({ zodiacSign: z, ...content });
    // Short delay between calls to encourage varied Gemini output per sign
    if (targetZodiacs.length > 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  res.json({ success: true, data: generated });
};

export const dashboardStatsHandler = async (_req: Request, res: Response) => {
  const stats = await getDashboardStats();
  res.json({ success: true, data: stats });
};

