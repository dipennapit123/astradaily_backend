import { prisma } from "../../utils/prisma";
import type { ZodiacSign } from "../../generated/client";

export const getLatestHoroscopeForZodiac = async (zodiac: ZodiacSign) => {
  return prisma.horoscope.findFirst({
    where: { zodiacSign: zodiac, isPublished: true },
    orderBy: { date: "desc" },
  });
};

export const getHoroscopeHistoryForZodiac = async (
  zodiac: ZodiacSign,
  limit = 30,
) => {
  const published = await prisma.horoscope.findMany({
    where: { zodiacSign: zodiac, isPublished: true },
    orderBy: { date: "desc" },
    take: limit,
  });

  // If nothing has been formally published yet, fall back to any drafts
  if (published.length === 0) {
    return prisma.horoscope.findMany({
      where: { zodiacSign: zodiac },
      orderBy: { date: "desc" },
      take: limit,
    });
  }

  return published;
};

