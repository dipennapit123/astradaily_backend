# Use Supabase as the database

Supabase is PostgreSQL. The backend already works with it — you only need a connection string and to run the schema once.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. **New project** → choose org, name, database password, region.
3. Wait for the project to be ready.

## 2. Get the connection string

1. In the project, open **Project Settings** (gear) → **Database**.
2. Under **Connection string**, pick **URI**.
3. Copy the URI. It looks like:
   ```text
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   Or for direct connection:
   ```text
   postgresql://postgres:[YOUR-PASSWORD]@db.[ref].supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your database password (set when you created the project).

## 3. Set it in the backend

**Local (`.env`):**

```env
DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Railway (or any host):**  
Add `DATABASE_URL` in Variables and paste the same value. No need for separate DB_USER/DB_HOST etc. — one variable is enough.

Optional: Supabase sometimes exposes `SUPABASE_DB_URL`; the backend also reads that if `DATABASE_URL` is not set.

## 4. Run the schema once

Apply the tables and enums:

**Option A — from your machine (with `DATABASE_URL` set):**

```bash
cd backend
npm run db:migrate
```

**Option B — in Supabase:**  
Open **SQL Editor**, paste the contents of `backend/sql/schema.sql`, and run it.

## 5. Start the backend

```bash
cd backend
npm run dev
```

You should see `[db] Connection OK` and the API will use Supabase for all data.

---

**Summary:** One URL in `DATABASE_URL`, run the schema once, then use the app as before. No Railway Postgres or variable references required.
