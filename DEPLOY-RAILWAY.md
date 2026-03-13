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

- **Start Command:**  
  `npx prisma migrate deploy && node dist/server.js`

## 4. Add PostgreSQL

1. In the same project, click **New** → **Database** → **PostgreSQL**.
2. After it’s created, open the PostgreSQL service → **Variables** (or **Connect**).
3. Copy the **`DATABASE_URL`** value (or note that Railway can inject it when you link the service).

## 5. Link database and set variables

1. In your **backend service** → **Variables**.
2. Click **Add variable** or **Link variable** and link the Postgres **`DATABASE_URL`** from the database service (Railway can add it automatically when you use “Link”).
3. Add the rest of the variables:

| Variable | Example / notes |
|----------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | Usually set by Railway; if not, use `4000` |
| `CLERK_JWT_ISSUER` | From Clerk Dashboard → JWT template (e.g. `https://your-clerk.clerk.accounts.dev`) |
| `CLERK_JWT_AUDIENCE` | From Clerk (optional if not using custom JWT template) |
| `ADMIN_JWT_SECRET` | Long random string (e.g. from `openssl rand -base64 32`) |
| `GROQ_API_KEY` | Your Groq API key (if used) |
| `GEMINI_API_KEY` | Your Gemini API key (if used) |

Leave **DATABASE_URL** to the linked Postgres service if you linked it; otherwise paste the connection string from the Postgres variables.

## 6. Deploy and get URL

1. Save settings; Railway will build and deploy.
2. In the backend service, open **Settings** → **Networking** → **Generate Domain** to get a public URL (e.g. `https://your-service.up.railway.app`).
3. Use this URL as your API base in the mobile app and admin dashboard (e.g. `https://your-service.up.railway.app`).

## 7. After first deploy

- Check **Deployments** for build and runtime logs.
- If migrations fail, ensure `DATABASE_URL` is set and that the Postgres service is running.
- In **Clerk**, add your Railway backend URL to allowed origins/redirect URLs if required for production.

## Optional: run migrations manually

From your machine (with `DATABASE_URL` pointing at Railway Postgres), in the backend repo root:

```bash
npx prisma migrate deploy
```

Or use Railway’s **Shell** for the backend service and run the same command there.
