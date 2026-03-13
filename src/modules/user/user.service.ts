import { prisma } from "../../utils/prisma";
import type { ZodiacSign, Prisma, UserActivityAction } from "../../generated/client";

export const syncClerkUser = async (params: {
  clerkUserId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  timezone?: string;
}) => {
  const user = await prisma.user.upsert({
    where: { clerkUserId: params.clerkUserId },
    create: {
      clerkUserId: params.clerkUserId,
      email: params.email,
      fullName: params.fullName,
      avatarUrl: params.avatarUrl,
      timezone: params.timezone,
    },
    update: {
      email: params.email,
      fullName: params.fullName,
      avatarUrl: params.avatarUrl,
      ...(params.timezone != null && { timezone: params.timezone }),
    },
  });

  return user;
};

export const getCurrentUser = async (clerkUserId: string) => {
  return prisma.user.findUnique({
    where: { clerkUserId },
  });
};

export const updateUserZodiac = async (
  clerkUserId: string,
  zodiac: ZodiacSign,
) => {
  try {
    return await prisma.user.update({
      where: { clerkUserId },
      data: { zodiacSign: zodiac },
    });
  } catch (err: any) {
    // If the user doesn't exist yet (e.g. sync failed), create a minimal record
    if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2025") {
      return prisma.user.create({
        data: {
          clerkUserId,
          email: `${clerkUserId}@astradaily.local`,
          zodiacSign: zodiac,
        },
      });
    }
    throw err;
  }
};

const DEDUPE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export const recordActivity = async (
  clerkUserId: string,
  action: UserActivityAction,
  meta?: {
    sessionId?: string;
    timezone?: string;
    platform?: string;
    appVersion?: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
  });
  if (!user) return null;
  const now = new Date();
  const since = new Date(now.getTime() - DEDUPE_WINDOW_MS);

  const recentSame = await prisma.userActivity.findFirst({
    where: {
      userId: user.id,
      action,
      createdAt: { gte: since },
    },
  });

  if (recentSame) {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: now },
    });
    return recentSame;
  }

  const updateData: { lastActiveAt: Date; timezone?: string } = { lastActiveAt: now };
  if (meta?.timezone != null) updateData.timezone = meta.timezone;

  await prisma.$transaction([
    prisma.userActivity.create({
      data: {
        userId: user.id,
        action,
        sessionId: meta?.sessionId ?? null,
        platform: meta?.platform ?? null,
        appVersion: meta?.appVersion ?? null,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: updateData,
    }),
  ]);
  return prisma.userActivity.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
};

