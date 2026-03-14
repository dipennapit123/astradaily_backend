import { Pool } from "pg";

export function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    process.env.POSTGRES_URL ||
    ""
  ).trim();
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
  if (!pool) throw new Error("Database not configured: DATABASE_URL is not set.");
  const result = await pool.query(text, values);
  return { rows: (result.rows as T[]), rowCount: result.rowCount ?? 0 };
}

/** Run SELECT 1 to verify connection. */
export async function ping(): Promise<void> {
  const { rows } = await query<{ "?column?": number }>("SELECT 1");
  if (!rows.length) throw new Error("Database ping returned no rows");
}
