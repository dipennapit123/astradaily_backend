# Deploy backend to Vercel

The Express app can run on Vercel as a serverless function. Use **one** of these:

- **Railway** – long-running server, `node dist/server.js`
- **Vercel** – serverless, uses `src/index.ts` (exports the app)

## 1. Push backend to a repo Vercel can use

Use your existing backend repo (e.g. AstraDaily-Backend) or a new one. Ensure it has:

- `src/index.ts` (Vercel entry, exports the Express app)
- `vercel.json` (optional; build command)
- Same code as the monorepo `backend/` folder

## 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import the **backend** GitHub repo.
3. **Root Directory:** leave default (repo root = backend).
4. **Build Command:** `npm run build` (or leave empty; Vercel may auto-detect).
5. **Output Directory:** leave empty (not a static site).

## 3. Environment variables

In the project → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Supabase URL (use `%40` for `@` in password) |
| `ADMIN_JWT_SECRET` | Your secret |
| `CLERK_JWT_ISSUER` | `https://verified-krill-13.clerk.accounts.dev` (or your Clerk URL) |
| `GROQ_API_KEY` | Your Groq key (if used) |
| `NODE_ENV` | `production` |

No quotes in the value field.

## 4. Deploy

Click **Deploy**. After deploy, your API base URL will be like:

`https://your-project.vercel.app`

Use **`https://your-project.vercel.app/api`** as the API base in the admin dashboard and mobile app (e.g. `https://your-project.vercel.app/api/health`).

## 5. Limits

- **Execution time:** 10s (Hobby) / 60s (Pro). Keep horoscope generation and DB calls within that.
- **Cold starts:** First request after idle may be slower.
- **Database:** Supabase works; ensure connection string is set and schema is applied.

## Local dev

Still use `npm run dev` (runs `server.ts` with `app.listen`). Vercel uses `src/index.ts` only in the cloud.
