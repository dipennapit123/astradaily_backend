# Connect pgAdmin to Railway Postgres

You can use **pgAdmin** to view and edit your AstraDaily database. The backend uses direct PostgreSQL (the `pg` package); pgAdmin connects to the same database.

## 1. Get the connection details from Railway

1. Go to [railway.app](https://railway.app) → your project.
2. Click the **Postgres** service (the database).
3. Open the **Variables** or **Connect** tab.
4. Copy **`DATABASE_URL`** or note the individual fields. The URL looks like:
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/railway
   ```
   - **User:** `postgres` (or the user in the URL)
   - **Password:** the password after `postgres:`
   - **Host:** the hostname (e.g. `monorail.proxy.rlwy.net` or `postgres.railway.internal` for private)
   - **Port:** usually `5432`
   - **Database:** e.g. `railway`

**Important:** To connect from your computer (e.g. pgAdmin), use the **public** connection URL. In Railway Postgres, open **Connect** and use the **Public** URL (not the one with `railway.internal`).

## 2. Add the server in pgAdmin

1. Open **pgAdmin**.
2. Right-click **Servers** in the left tree → **Register** → **Server**.
3. **General** tab:
   - **Name:** e.g. `AstraDaily Railway`
4. **Connection** tab:
   - **Host name/address:** from your URL (e.g. `monorail.proxy.rlwy.net`).
   - **Port:** `5432` (or the port in your URL).
   - **Maintenance database:** `railway` (or your DB name).
   - **Username:** `postgres` (or your user).
   - **Password:** paste the password.
   - Optionally check **Save password**.
5. Click **Save**.

## 3. Browse your data

- Expand **Servers** → **AstraDaily Railway** → **Databases** → **railway** → **Schemas** → **public** → **Tables**.
- You’ll see tables such as **User**, **Admin**, **Horoscope**, **UserActivity**.
- Right-click a table → **View/Edit Data** → **All Rows** to view or edit.

Your backend uses the `pg` driver; pgAdmin is another client to the same database.
