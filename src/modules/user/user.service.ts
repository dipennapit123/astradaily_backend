import { randomUUID } from "crypto";
import { query } from "../../db";
import type { ZodiacSign, UserActivityAction } from "../../types";

export const syncClerkUser = async (params: {
  clerkUserId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  timezone?: string;
}) => {
  const r = await query<{ id: string }>(
    `SELECT id FROM "User" WHERE "clerkUserId" = $1`,
    [params.clerkUserId],
  );
  const existing = r.rows[0];
  const now = new Date().toISOString();

  if (existing) {
    await query(
      `UPDATE "User" SET email = $1, "fullName" = $2, "avatarUrl" = $3, timezone = $4, "updatedAt" = $5
       WHERE "clerkUserId" = $6`,
      [
        params.email,
        params.fullName ?? null,
        params.avatarUrl ?? null,
        params.timezone ?? null,
        now,
        params.clerkUserId,
      ],
    );
    const u = await query(
      `SELECT id, "clerkUserId", email, "fullName", "avatarUrl", "zodiacSign", timezone, "lastActiveAt", "createdAt", "updatedAt"
       FROM "User" WHERE "clerkUserId" = $1`,
      [params.clerkUserId],
    );
    return u.rows[0] as Record<string, unknown>;
  }

  const id = randomUUID();
  await query(
    `INSERT INTO "User" (id, "clerkUserId", email, "fullName", "avatarUrl", timezone, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
    [
      id,
      params.clerkUserId,
      params.email,
      params.fullName ?? null,
      params.avatarUrl ?? null,
      params.timezone ?? null,
      now,
    ],
  );
  const u = await query(
    `SELECT id, "clerkUserId", email, "fullName", "avatarUrl", "zodiacSign", timezone, "lastActiveAt", "createdAt", "updatedAt"
     FROM "User" WHERE id = $1`,
    [id],
  );
  return u.rows[0] as Record<string, unknown>;
};

export const getCurrentUser = async (clerkUserId: string) => {
  const r = await query(
    `SELECT id, "clerkUserId", email, "fullName", "avatarUrl", "zodiacSign", timezone, "lastActiveAt", "createdAt", "updatedAt"
     FROM "User" WHERE "clerkUserId" = $1`,
    [clerkUserId],
  );
  return r.rows[0] ?? null;
};

export const updateUserZodiac = async (
  clerkUserId: string,
  zodiac: ZodiacSign,
) => {
  const r = await query(
    `UPDATE "User" SET "zodiacSign" = $1, "updatedAt" = $2 WHERE "clerkUserId" = $3
     RETURNING id, "clerkUserId", email, "fullName", "avatarUrl", "zodiacSign", timezone, "lastActiveAt", "createdAt", "updatedAt"`,
    [zodiac, new Date().toISOString(), clerkUserId],
  );
  if (r.rows.length > 0) return r.rows[0] as Record<string, unknown>;

  // User might not exist yet; create minimal record
  const id = randomUUID();
  const now = new Date().toISOString();
  await query(
    `INSERT INTO "User" (id, "clerkUserId", email, "zodiacSign", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $5)`,
    [id, clerkUserId, `${clerkUserId}@astradaily.local`, zodiac, now],
  );
  const u = await query(
    `SELECT id, "clerkUserId", email, "fullName", "avatarUrl", "zodiacSign", timezone, "lastActiveAt", "createdAt", "updatedAt"
     FROM "User" WHERE id = $1`,
    [id],
  );
  return u.rows[0] as Record<string, unknown>;
};

const DEDUPE_WINDOW_MS = 5 * 60 * 1000;

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
  const userResult = await query(
    `SELECT id FROM "User" WHERE "clerkUserId" = $1`,
    [clerkUserId],
  );
  const user = userResult.rows[0] as { id: string } | undefined;
  if (!user) return null;

  const now = new Date();
  const since = new Date(now.getTime() - DEDUPE_WINDOW_MS);

  const recentResult = await query(
    `SELECT id, "userId", action, "sessionId", platform, "appVersion", "createdAt"
     FROM "UserActivity"
     WHERE "userId" = $1 AND action = $2 AND "createdAt" >= $3
     ORDER BY "createdAt" DESC LIMIT 1`,
    [user.id, action, since.toISOString()],
  );
  const recentSame = recentResult.rows[0];
  if (recentSame) {
    await query(
      `UPDATE "User" SET "lastActiveAt" = $1, "updatedAt" = $1 WHERE id = $2`,
      [now.toISOString(), user.id],
    );
    return recentSame as Record<string, unknown>;
  }

  const updateData: { lastActiveAt: string; timezone?: string } = {
    lastActiveAt: now.toISOString(),
  };
  if (meta?.timezone != null) updateData.timezone = meta.timezone;

  const activityId = randomUUID();
  await query(
    `INSERT INTO "UserActivity" (id, "userId", action, "sessionId", platform, "appVersion")
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      activityId,
      user.id,
      action,
      meta?.sessionId ?? null,
      meta?.platform ?? null,
      meta?.appVersion ?? null,
    ],
  );
  if (updateData.timezone) {
    await query(
      `UPDATE "User" SET "lastActiveAt" = $1, "updatedAt" = $1, timezone = $3 WHERE id = $2`,
      [updateData.lastActiveAt, user.id, updateData.timezone],
    );
  } else {
    await query(
      `UPDATE "User" SET "lastActiveAt" = $1, "updatedAt" = $1 WHERE id = $2`,
      [updateData.lastActiveAt, user.id],
    );
  }

  const created = await query(
    `SELECT id, "userId", action, "sessionId", platform, "appVersion", "createdAt"
     FROM "UserActivity" WHERE id = $1`,
    [activityId],
  );
  return created.rows[0] as Record<string, unknown>;
};
