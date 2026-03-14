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
 * Prefer DATABASE_URL / SUPABASE_DB_URL (e.g. Supabase). If not set, build from DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME.
 */
export function getDatabaseUrl(): string {
  const raw =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.POSTGRES_URL ||
    "";
  const url = raw.trim();
  if (url && !url.startsWith("${{")) return url;

  return buildUrlFromParts();
}

let _pool: Pool | null = null;

/** Create pool on first use so env (e.g. DATABASE_URL on Railway) is read at request time. */
export function getPool(): Pool | null {
  if (_pool) return _pool;
  const url = getDatabaseUrl();
  if (!url || url === "postgresql://localhost:5432/placeholder") return null;
  _pool = new Pool({ connectionString: url, max: 10 });
  return _pool;
}

export async function query<T = unknown>(
  text: string,
  values?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  const p = getPool();
  if (!p) throw new Error("Database not configured: set DATABASE_URL or DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME.");
  const result = await p.query(text, values);
  return { rows: (result.rows as T[]), rowCount: result.rowCount ?? 0 };
}

/** Run SELECT 1 to verify connection. */
export async function ping(): Promise<void> {
  const { rows } = await query<{ "?column?": number }>("SELECT 1");
  if (!rows.length) throw new Error("Database ping returned no rows");
}
