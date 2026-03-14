import "dotenv/config";
import { createApp } from "./app";
import { getDatabaseUrl, ping, pool } from "./db";

const app = createApp();

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const dbUrl = getDatabaseUrl();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on ${PORT}`);
  if (!dbUrl || !pool) {
    // eslint-disable-next-line no-console
    console.error(
      "[db] DATABASE_URL is empty. Set it in Railway → Backend service → Variables (e.g. link from Postgres)."
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
      console.log("[db] Connection OK");
    })
    .catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error("[db] Connection failed:", err instanceof Error ? err.message : String(err));
    });
});

