# Railway deploy checklist (Supabase)

If the backend still says "DATABASE_URL not set" or connection fails, check:

## 1. Correct service
- Open your **backend** service (the one that runs `node dist/server.js`), **not** the Postgres service.
- Go to **Variables** for **that** service.

## 2. Variable name exactly
- Name must be **`DATABASE_URL`** (no space, no typo).
- Value = your full Supabase URL. If the password contains `@`, use `%40` instead, e.g.:
  `postgresql://postgres:YourPass%40123@db.xxxx.supabase.co:5432/postgres`

## 3. Redeploy
- After adding or changing variables, click **Redeploy** (Deployments tab) so the new env is used.

## 4. Build & start
- **Build:** `npm install && npm run build`
- **Start:** `node dist/server.js`
- **Root directory:** empty (repo root = backend)

## 5. Logs
After deploy, open **Logs**. You should see:
- `[startup] DATABASE_URL or SUPABASE_DB_URL: set`
- `[db] Using host: db.xxxx.supabase.co`
- `[db] Connection OK`

If you see `NOT SET`, the backend service is not receiving `DATABASE_URL` — double-check step 1 and 2, then redeploy.
