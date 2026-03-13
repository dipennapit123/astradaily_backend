import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, AdminRole, ZodiacSign } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@example.com",
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  const today = new Date();

  const signs: ZodiacSign[] = [
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
  ];

  for (const sign of signs) {
    await prisma.horoscope.upsert({
      where: {
        zodiacSign_date: {
          zodiacSign: sign,
          date: today,
        },
      } as any,
      update: {},
      create: {
        zodiacSign: sign,
        date: today,
        title: "Cosmic Alignment",
        summary: `A sample seeded horoscope for ${sign}.`,
        wealthText: "Finances remain steady as you make grounded choices.",
        loveText: "Conversations open the door to deeper emotional clarity.",
        healthText: "Small, consistent habits move the needle on your vitality.",
        wealthConfidence: 80,
        loveConfidence: 75,
        healthConfidence: 82,
        wealthActionLabel: "Explore Strategy",
        loveActionLabel: "Dating Advice",
        healthActionLabel: "Daily Ritual",
        weeklyOutlook:
          "The week ahead encourages patient steps toward your long-term vision.",
        isPublished: true,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Database seeded.");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

