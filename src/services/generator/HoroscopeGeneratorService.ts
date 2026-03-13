import type { ZodiacSign } from "../../generated/client";

export type HoroscopeTone = "mystical" | "modern" | "friendly" | "premium";

export interface GenerateHoroscopeInput {
  zodiacSign: ZodiacSign;
  date: Date;
  tone: HoroscopeTone;
  notes?: string;
}

export interface GeneratedHoroscopeContent {
  title: string;
  summary: string;
  wealthText: string;
  loveText: string;
  healthText: string;
  weeklyOutlook?: string;
}

export interface HoroscopeGeneratorService {
  generate(
    input: GenerateHoroscopeInput,
  ): Promise<GeneratedHoroscopeContent>;
}

