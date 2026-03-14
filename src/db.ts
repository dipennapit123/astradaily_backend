import { Pool } from "pg";

/** Build connection URL from separate env vars (e.g. DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME). */
function buildUrlFromParts(): string {
  const user =
    process.env.DB_USER ||
    process.env.POSTGRES_USER ||
    process.env.PGUSER ||
    "postgres";
  const password =
    process.env.DB_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    process.env.PGPASSWORD ||
    "";
  const host =
    process.env.DB_HOST ||
    process.env.POSTGRES_HOST ||
    process.env.PGHOST ||
    "localhost";
  const port =
    process.env.DB_PORT ||
    process.env.POSTGRES_PORT ||
    process.env.PGPORT ||
    "5432";
  const database =
    process.env.DB_NAME ||
    process.env.POSTGRES_DB ||
    process.env.PGDATABASE ||
    "railway";

  if (!password) return "";

  const encodedPassword = encodeURIComponent(password);
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}`;
}

/**
 * Prefer connection built from DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME (e.g. when hosting).
 * Fall back to DATABASE_URL / POSTGRES_URL if parts are not set.
 */
export function getDatabaseUrl(): string {
  const fromParts = buildUrlFromParts();
  if (fromParts) return fromParts;

  const raw =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.POSTGRES_URL ||
    "";
  const url = raw.trim();
  if (url.startsWith("${{") && url.includes("DATABASE_URL")) return "";
  return url;
}

const connectionString = getDatabaseUrl();
const isPlaceholder =
  !connectionString || connectionString === "postgresql://localhost:5432/placeholder";

export const pool: Pool | null = !isPlaceholder
  ? new Pool({ connectionString, max: 10 })
  : null;

export async function query<T = unknown>(
  text: string,
  values?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  if (!pool) throw new Error("Database not configured: set DATABASE_URL or DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME.");
  const result = await pool.query(text, values);
  return { rows: (result.rows as T[]), rowCount: result.rowCount ?? 0 };
}

/** Run SELECT 1 to verify connection. */
export async function ping(): Promise<void> {
  const { rows } = await query<{ "?column?": number }>("SELECT 1");
  if (!rows.length) throw new Error("Database ping returned no rows");
}
