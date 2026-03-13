import axios from "axios";
import type {
  GenerateHoroscopeInput,
  GeneratedHoroscopeContent,
  HoroscopeGeneratorService,
} from "./HoroscopeGeneratorService";

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

const signFlavors: Record<string, string> = {
  ARIES: "bold, impulsive, pioneering fire-sign energy that prefers action over hesitation.",
  TAURUS: "steady, sensual, earth-bound energy that values comfort, stability, and tangible results.",
  GEMINI: "curious, quick-thinking, air-sign energy that loves conversation, ideas, and mental variety.",
  CANCER: "intuitive, protective, water-sign energy that prioritizes emotional safety and home.",
  LEO: "radiant, dramatic, heart-led fire-sign energy that wants to be seen and shine authentically.",
  VIRGO: "precise, service-oriented, earth-sign energy that refines details and optimizes routines.",
  LIBRA: "harmonizing, relationship-focused air-sign energy that seeks balance, beauty, and fairness.",
  SCORPIO: "intense, transformative water-sign energy that moves beneath the surface and craves depth.",
  SAGITTARIUS: "expansive, truth-seeking fire-sign energy that craves freedom, travel, and big perspectives.",
  CAPRICORN: "ambitious, disciplined earth-sign energy that patiently builds long-term structures.",
  AQUARIUS: "futuristic, unconventional air-sign energy that innovates and values community.",
  PISCES: "dreamy, empathetic water-sign energy that blurs boundaries between imagination and reality.",
};

export class GeminiHoroscopeGenerator implements HoroscopeGeneratorService {
  constructor(private readonly apiKey: string) {}

  async generate(
    input: GenerateHoroscopeInput,
  ): Promise<GeneratedHoroscopeContent> {
    const prompt = this.buildPrompt(input);

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const res = await axios.post<GeminiResponse>(
      `${url}?key=${this.apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.95,
          topP: 0.9,
          topK: 32,
        },
      },
    );

    const raw =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text ??
      '{"title":"Cosmic Alignment","summary":"A balanced day.","wealthText":"Focus on steady progress.","loveText":"Be present with the people you care about.","healthText":"Listen to your body and rest when needed.","weeklyOutlook":"This week is about aligning intentions with action."}';

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    return {
      title: parsed.title ?? "Cosmic Alignment",
      summary:
        parsed.summary ??
        "The stars highlight a moment to realign your everyday choices with your deeper intentions.",
      wealthText:
        parsed.wealthText ??
        "Grounded choices around money create more stability than quick wins today.",
      loveText:
        parsed.loveText ??
        "Honest, compassionate conversations open the door to deeper connection.",
      healthText:
        parsed.healthText ??
        "Gentle movement and mindful pauses help you feel centered and restored.",
      weeklyOutlook:
        parsed.weeklyOutlook ??
        "Across the week, subtle shifts accumulate into meaningful momentum.",
    };
  }

  private buildPrompt(input: GenerateHoroscopeInput): string {
    const signFlavor =
      signFlavors[input.zodiacSign] ??
      "use the sign's classic strengths and challenges in a grounded way.";

    const dateStr = input.date.toISOString().slice(0, 10);
    return [
      "You are an astrology copywriter for a premium mobile horoscope app called AstraDaily.",
      "Write a single day's horoscope for the given zodiac sign and date. Use simple, human, easy-to-read language—as if you're giving friendly advice, not a puzzle or a poem.",
      "",
      "CRITICAL – UNIQUENESS: You are generating for ONE sign only: " +
        input.zodiacSign +
        " on " +
        dateStr +
        ". Every zodiac sign and every date must get completely different text. Do NOT reuse the same wording for WEALTH, LOVE, or HEALTH across different signs on this date. Each sign has different traits—reflect them. Each date has different transits—vary the advice. If your output could apply to any sign, rewrite it so it clearly fits " +
        input.zodiacSign +
        " only.",
      "",
      "Assume the sky is slightly different each day—shift the focus, opportunities, and cautions so two different days never read the same.",
      "Return ONLY a compact JSON object with this exact shape and no extra keys:",
      '{',
      '  "title": string,',
      '  "summary": string,',
      '  "wealthText": string,  // money / work guidance tailored to THIS sign',
      '  "loveText": string,    // relationships / self-love tailored to THIS sign',
      '  "healthText": string,  // body / energy / mental health tailored to THIS sign',
      '  "weeklyOutlook": string',
      "}",
      "",
      `Zodiac sign: ${input.zodiacSign} – ${signFlavor}`,
      `Date: ${dateStr} (treat this day as astrologically distinct).`,
      `Requested tone: ${input.tone} (honor this tone strongly).`,
      input.notes
        ? `Extra guidance from the human astrologer: ${input.notes}`
        : "",
      "",
      "Write in SIMPLE, PLAIN ENGLISH. Use everyday words and short sentences. Sound like a helpful friend, not a riddle or a poem—no cryptic or flowery language. Be clear and direct so anyone can understand at first read.",
      "For THIS sign and date, make WEALTH, LOVE, and HEALTH clearly different from each other and obviously linked to this sign's traits. Avoid generic coaching lines that could describe any sign.",
      "Keep each field to 1–3 sentences. Avoid clichés and jargon.",
      "Do NOT use the phrase 'A refined celestial forecast crafted for your next bold move' or any similar generic tagline in the summary—write a unique summary for each sign and date.",
      "You MAY mention planet themes, transits, and astrological influences (e.g. Mars, Venus, Mercury retrogrades, lunar phases)—explain them in simple terms so the energy matches the sign and feels unique for this date.",
    ]
      .filter(Boolean)
      .join("\n");
  }
}

