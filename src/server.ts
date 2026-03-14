import "dotenv/config";

// Log env state immediately so Railway logs show what the process sees
const hasDbUrl = !!(
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.POSTGRES_URL
);
// eslint-disable-next-line no-console
console.log(`[startup] DATABASE_URL or SUPABASE_DB_URL: ${hasDbUrl ? "set" : "NOT SET"}`);

import { createApp } from "./app";
import { getDatabaseUrl, ping } from "./db";

const app = createApp();

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on ${PORT}`);
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    // eslint-disable-next-line no-console
    console.error(
      "[db] No database URL. In Railway: Backend service → Variables → add DATABASE_URL with your Supabase URL (password: use %40 for @)."
    );
    return;
  }
  try {
    const u = new URL(dbUrl);
    // eslint-disable-next-line no-console
    console.log(`[db] Using host: ${u.hostname}`);
  } catch {
    // eslint-disable-next-line no-console
    console.log("[db] DATABASE_URL set (url parse skipped)");
  }
  ping()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log("[db] Connection OK — database ready, API will serve user data.");
    })
    .catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error("[db] Connection failed:", err instanceof Error ? err.message : String(err));
    });
});

