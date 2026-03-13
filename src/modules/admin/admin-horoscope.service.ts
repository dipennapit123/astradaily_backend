import type { Prisma, ZodiacSign } from "../../generated/client";
import { prisma } from "../../utils/prisma";
import type {
  GenerateHoroscopeInput,
  HoroscopeTone,
  HoroscopeGeneratorService,
} from "../../services/generator/HoroscopeGeneratorService";
import { MockHoroscopeGenerator } from "../../services/generator/MockHoroscopeGenerator";
import { GeminiHoroscopeGenerator } from "../../services/generator/GeminiHoroscopeGenerator";
import { GroqHoroscopeGenerator } from "../../services/generator/GroqHoroscopeGenerator";
import { env } from "../../config/env";

let baseGenerator: HoroscopeGeneratorService;
if (env.groqApiKey) {
  baseGenerator = new GroqHoroscopeGenerator(env.groqApiKey);
} else if (env.geminiApiKey) {
  baseGenerator = new GeminiHoroscopeGenerator(env.geminiApiKey);
} else {
  baseGenerator = new MockHoroscopeGenerator();
}

export const listHoroscopes = async (params: {
  zodiacSign?: ZodiacSign;
  date?: Date;
  isPublished?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}) => {
  const where: Prisma.HoroscopeWhereInput = {};
  if (params.zodiacSign) where.zodiacSign = params.zodiacSign;
  if (params.date) where.date = params.date;
  if (typeof params.isPublished === "boolean")
    where.isPublished = params.isPublished;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { summary: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const page = params.page && params.page > 0 ? params.page : 1;
  const take = params.pageSize && params.pageSize > 0 ? params.pageSize : 12;
  const skip = (page - 1) * take;

  return prisma.horoscope.findMany({
    where,
    take,
    skip,
    orderBy: { date: "desc" },
  });
};

export const createHoroscope = async (
  data: Prisma.HoroscopeCreateInput,
) => prisma.horoscope.create({ data });

export const updateHoroscope = async (
  id: string,
  data: Prisma.HoroscopeUpdateInput,
) => prisma.horoscope.update({ where: { id }, data });

export const deleteHoroscope = async (id: string) => {
  try {
    await prisma.horoscope.delete({ where: { id } });
  } catch (err: any) {
    // Ignore if already deleted / not found to avoid noisy errors
    if ((err as any)?.code !== "P2025") {
      throw err;
    }
  }
};

export const publishHoroscope = async (id: string, isPublished: boolean) =>
  prisma.horoscope.update({ where: { id }, data: { isPublished } });

export const generateHoroscope = async (input: GenerateHoroscopeInput) => {
  return baseGenerator.generate(input);
};

export const getDashboardStats = async () => {
  const [totalHoroscopes, published, draft, totalUsers] = await Promise.all([
    prisma.horoscope.count(),
    prisma.horoscope.count({ where: { isPublished: true } }),
    prisma.horoscope.count({ where: { isPublished: false } }),
    prisma.user.count(),
  ]);

  return {
    totalHoroscopes,
    publishedHoroscopes: published,
    draftHoroscopes: draft,
    totalUsers,
  };
};

