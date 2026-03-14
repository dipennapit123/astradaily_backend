# Deploy AstraDaily backend to Railway

Backend repo: [AstraDaily-Backend](https://github.com/dipennapit123/AstraDaily-Backend)

## 1. Push backend code to the repo (one-time)

From the **monorepo root** (`ao-horoscope`):

```bash
./scripts/push-backend.sh
```

This copies `backend/` into a clone of AstraDaily-Backend and pushes. Ensure the [AstraDaily-Backend](https://github.com/dipennapit123/AstraDaily-Backend) repo exists on GitHub (empty is fine).

## 2. Create project and connect repo

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo**.
3. Select **dipennapit123/AstraDaily-Backend**.
4. Railway will add a service from that repo (root of repo = backend).

## 3. Configure the backend service

In the service **Settings**:

- **Root Directory:** leave empty (repo root is the backend).

- **Build Command:**  
  `npm install && npm run build`  
  (build runs `tsc`)

- **Start Command:**  
  `node dist/server.js`  
  (Run the schema once: `npm run db:migrate` with `DATABASE_URL` set, or run `sql/schema.sql` manually in your Postgres client.)

## 4. Add PostgreSQL

1. In the same project, click **New** → **Database** → **PostgreSQL**.
2. After it’s created, open the PostgreSQL service → **Variables** (or **Connect**).
3. Copy the **`DATABASE_URL`** value (or note that Railway can inject it when you link the service).

## 5. Link database and set variables (Clerk, database, Groq)

1. In your **backend service** → **Variables**.
2. Click **Add variable** or **Link variable** and link the Postgres **`DATABASE_URL`** from the database service (Railway can add it automatically when you use “Link”).
3. Add the variables below (paste into Railway Variables raw editor, or add one by one; replace placeholders):

```
NODE_ENV=production
PORT=4000
CLERK_JWT_ISSUER=https://YOUR_APP.clerk.accounts.dev
CLERK_JWT_AUDIENCE=
ADMIN_JWT_SECRET=REPLACE_WITH_LONG_RANDOM_STRING
GROQ_API_KEY=gsk_YOUR_GROQ_KEY
GEMINI_API_KEY=
```

- **CLERK_JWT_ISSUER:** Clerk Dashboard → API Keys → Frontend API URL.
- **ADMIN_JWT_SECRET:** Run `openssl rand -base64 32` and paste the output.
- **GROQ_API_KEY:** From [Groq Console](https://console.groq.com).

4. Reference (all variable names):

| Variable | Example / notes |
|----------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | Usually set by Railway; if not, use `4000` |
| `CLERK_JWT_ISSUER` | From Clerk Dashboard → JWT template (e.g. `https://your-clerk.clerk.accounts.dev`) |
| `CLERK_JWT_AUDIENCE` | From Clerk (optional if not using custom JWT template) |
| `ADMIN_JWT_SECRET` | Long random string (e.g. from `openssl rand -base64 32`) |
| `GROQ_API_KEY` | Your Groq API key (if used) |
| `GEMINI_API_KEY` | Your Gemini API key (if used) |

**Clerk:** Set `CLERK_JWT_ISSUER` to your Clerk Frontend API URL (e.g. `https://xxx.clerk.accounts.dev` from Clerk Dashboard → API Keys). The backend verifies mobile JWTs via this URL’s `/.well-known/jwks.json`. **Groq:** Set `GROQ_API_KEY` (from [Groq Console](https://console.groq.com)) so the backend uses Groq for horoscope generation. Leave **DATABASE_URL** to the linked Postgres service if you linked it; otherwise paste the connection string from the Postgres variables.

## 6. Deploy and get URL

1. Save settings; Railway will build and deploy.
2. In the backend service, open **Settings** → **Networking** → **Generate Domain** to get a public URL (e.g. `https://your-service.up.railway.app`).
3. Use this URL as your API base in the mobile app and admin dashboard (e.g. `https://your-service.up.railway.app`).

## 7. After first deploy

- Check **Deployments** for build and runtime logs.
- If migrations fail, ensure `DATABASE_URL` is set and that the Postgres service is running.
- In **Clerk**, add your Railway backend URL to allowed origins/redirect URLs if required for production.

## 8. DATABASE_URL not working (ECONNREFUSED / connection refused)

- **Variable must be on the backend service:** In Railway, click the **backend** service (the one that runs Node), then **Variables**. `DATABASE_URL` must appear in **this** service’s list. If it’s only on the Postgres service, the backend won’t see it.
- **Add by reference:** In the **backend** service → Variables → **New variable** → **Add a reference** (or “Link from another service”) → choose the **Postgres** service → select **DATABASE_URL**. Save and redeploy.
- **Or paste the URL:** From Postgres → Variables/Connect, copy the connection string. In the **backend** service → Variables, add a variable named exactly `DATABASE_URL` (no space) and paste the value. Use the **public** URL if the backend is in a different Railway project.
- **Redeploy:** After changing variables, use **Deployments** → **Redeploy** so the new value is loaded.
- **Check logs:** After deploy, open the backend **Logs**. You should see either `[db] Using host: ...` and `[db] Connection OK`, or `[db] DATABASE_URL is empty` / `[db] Connection failed: ...`. Use that to confirm the URL is set and the connection works.

## Optional: run migrations manually

From your machine (with `DATABASE_URL` pointing at Railway Postgres), in the backend repo root:

```bash
npm run db:migrate
```

Or use Railway’s **Shell** for the backend service and run the same command there.
