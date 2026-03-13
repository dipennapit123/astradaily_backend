import { prisma } from "../../utils/prisma";

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

function endOfDay(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(23, 59, 59, 999);
  return out;
}

function startOfMonth(d: Date): Date {
  const out = new Date(d);
  out.setUTCDate(1);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

function endOfMonth(d: Date): Date {
  const out = new Date(d);
  out.setUTCMonth(out.getUTCMonth() + 1);
  out.setUTCDate(0);
  out.setUTCHours(23, 59, 59, 999);
  return out;
}

export const listUsers = async (params?: { page?: number; pageSize?: number }) => {
  const page = params?.page && params.page > 0 ? params.page : 1;
  const pageSize = params?.pageSize && params.pageSize > 0 ? params.pageSize : 50;
  const skip = (page - 1) * pageSize;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        fullName: true,
        zodiacSign: true,
        timezone: true,
        createdAt: true,
        lastActiveAt: true,
        _count: { select: { activities: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      zodiacSign: u.zodiacSign,
      timezone: u.timezone ?? null,
      onboardedAt: u.createdAt,
      activityCount: u._count.activities,
      lastActiveAt: u.lastActiveAt ?? null,
    })),
    total,
    page,
    pageSize,
  };
};

export const getUserAnalytics = async () => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [dauRows, mauRows, yearlyRows] = await Promise.all([
    prisma.userActivity.findMany({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
      select: { userId: true },
    }),
    prisma.userActivity.findMany({
      where: { createdAt: { gte: monthStart, lte: monthEnd } },
      select: { userId: true },
    }),
    prisma.userActivity.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getUTCFullYear(), 0, 1),
          lte: now,
        },
      },
      select: { userId: true, createdAt: true },
    }),
  ]);

  const dau = new Set(dauRows.map((r) => r.userId)).size;
  const mau = new Set(mauRows.map((r) => r.userId)).size;

  const monthlyActiveUsers: { year: number; month: number; activeUsers: number }[] = [];
  const seen = new Map<string, Set<string>>();
  yearlyRows.forEach((r) => {
    const d = new Date(r.createdAt);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    if (!seen.has(key)) seen.set(key, new Set());
    seen.get(key)!.add(r.userId);
  });
  seen.forEach((userIds, key) => {
    const [y, m] = key.split("-").map(Number);
    monthlyActiveUsers.push({ year: y, month: m + 1, activeUsers: userIds.size });
  });
  monthlyActiveUsers.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month));

  return {
    dau,
    mau,
    yearly: monthlyActiveUsers,
  };
};

export const getUserActivity = async (
  userId: string,
  params?: { limit?: number },
) => {
  const limit = params?.limit && params.limit > 0 ? Math.min(params.limit, 200) : 50;

  const [user, activities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, zodiacSign: true, timezone: true, createdAt: true },
    }),
    prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  if (!user) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      zodiacSign: user.zodiacSign,
      timezone: user.timezone ?? null,
      onboardedAt: user.createdAt,
    },
    activities,
  };
};
