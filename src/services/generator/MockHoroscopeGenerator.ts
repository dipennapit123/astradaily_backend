import type {
  GenerateHoroscopeInput,
  GeneratedHoroscopeContent,
  HoroscopeGeneratorService,
} from "./HoroscopeGeneratorService";

const sampleTitles: string[] = [
  "Cosmic Alignment",
  "Stellar Shift",
  "Lunar Guidance",
  "Planetary Pulse",
  "Star Path",
  "Celestial Moment",
  "Transit Day",
];

const sampleSummaries: string[] = [
  "Today stretches like a quiet threshold: subtle choices around timing, pacing, and who you answer first ripple farther than you expect.",
  "The day asks you to zoom out; when you remember the longer story you’re trying to live, the small frictions suddenly make more sense.",
  "You’re standing at a fork between familiar comfort and aligned discomfort—choosing the latter plants the seeds for real momentum.",
  "Old patterns tug at your sleeve, but a new option appears the moment you pause before reacting out of habit.",
  "Energy favors clarity today. Say what you mean and listen before you reply.",
  "A small step in the right direction beats a big leap into the unknown.",
  "Your instincts are sharp; trust them when something feels off.",
  "Rest is part of the plan. Pacing yourself today pays off tomorrow.",
];

const sampleWealth: string[] = [
  "Treat your finances like a project, not a problem. Spend twenty focused minutes reviewing recurring costs, then redirect even a small win toward a goal that excites you.",
  "A conversation about value—your rates, your role, or your responsibilities—can shift the way money flows toward you. Lead with clarity, not apology.",
  "Instead of chasing a dramatic payout, refine one steady income stream. A small, repeatable improvement outperforms a one‑time leap.",
  "Your relationship with resources mirrors your relationship with self‑trust. Align your spending with what genuinely nourishes you, not what only looks impressive.",
];

const sampleLove: string[] = [
  "Slow down enough to really hear the people you care about. Asking one thoughtful follow‑up question lands as a deeper act of love than a quick solution.",
  "If tension has been building, name the feeling without blame. Vulnerability around your own needs opens space for them to meet you in the middle.",
  "Romance today lives in the micro‑moments: responding to a message with presence, keeping a small promise, or being the first to say sorry.",
  "Single or partnered, you’re asked to choose relationships where you can show up as your full self, not just the version that’s easiest for others to accept.",
];

const sampleHealth: string[] = [
  "Your nervous system is the real MVP today—nourish it with rhythm: consistent meals, gentle movement, and one clear boundary around screen time.",
  "Notice where your body whispers before it has to shout. A stretch, glass of water, or early night now prevents a larger crash later.",
  "Energy levels respond well to simple, repeatable rituals. Think: same morning walk, same playlist, same wind‑down cue before sleep.",
  "Your body wants collaboration, not control. Choose one supportive action because you care about how you feel, not because you’re frustrated with how you look.",
];

const pick = (arr: string[], seed: number) => arr[seed % arr.length];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export class MockHoroscopeGenerator implements HoroscopeGeneratorService {
  async generate(
    input: GenerateHoroscopeInput,
  ): Promise<GeneratedHoroscopeContent> {
    const dayKey =
      input.date.getUTCFullYear() * 10000 +
      (input.date.getUTCMonth() + 1) * 100 +
      input.date.getUTCDate();
    const seed = dayKey + hashString(input.zodiacSign) * 17;

    return {
      title: pick(sampleTitles, seed),
      summary: pick(sampleSummaries, seed),
      wealthText: pick(sampleWealth, seed),
      loveText: pick(sampleLove, seed * 7),
      healthText: pick(sampleHealth, seed * 11),
      weeklyOutlook: undefined,
    };
  }
}

