/**
 * Run sql/schema.sql against DATABASE_URL.
 * Usage: DATABASE_URL=... node scripts/run-migrate.js
 * Or from backend/: npm run db:migrate
 */
require("dotenv").config();
const { readFileSync } = require("fs");
const { join } = require("path");
const { Pool } = require("pg");

const url =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.POSTGRES_URL;

if (!url) {
  console.error("Set DATABASE_URL (or POSTGRES_URL) in env.");
  process.exit(1);
}

const sqlPath = join(__dirname, "..", "sql", "schema.sql");
const sql = readFileSync(sqlPath, "utf8");

const pool = new Pool({ connectionString: url });

pool
  .query(sql)
  .then(() => {
    console.log("Schema applied successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
