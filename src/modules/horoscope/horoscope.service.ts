import { query } from "../../db";
import type { ZodiacSign } from "../../types";

export const getLatestHoroscopeForZodiac = async (zodiac: ZodiacSign) => {
  const r = await query(
    `SELECT * FROM "Horoscope"
     WHERE "zodiacSign" = $1 AND "isPublished" = true
     ORDER BY date DESC LIMIT 1`,
    [zodiac],
  );
  return r.rows[0] ?? null;
};

export const getHoroscopeHistoryForZodiac = async (
  zodiac: ZodiacSign,
  limit = 30,
) => {
  const published = await query(
    `SELECT * FROM "Horoscope"
     WHERE "zodiacSign" = $1 AND "isPublished" = true
     ORDER BY date DESC LIMIT $2`,
    [zodiac, limit],
  );
  if (published.rows.length > 0) return published.rows;

  const drafts = await query(
    `SELECT * FROM "Horoscope"
     WHERE "zodiacSign" = $1
     ORDER BY date DESC LIMIT $2`,
    [zodiac, limit],
  );
  return drafts.rows;
};
