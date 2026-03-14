import dotenv from "dotenv";

dotenv.config();

// Railway and some hosts use DATABASE_URL; Railway also exposes DATABASE_PUBLIC_URL / DATABASE_PRIVATE_URL / POSTGRES_URL
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.POSTGRES_URL ||
  "";

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl,
  clerkJwtAudience: process.env.CLERK_JWT_AUDIENCE ?? "",
  clerkJwtIssuer: process.env.CLERK_JWT_ISSUER ?? "",
  adminJwtSecret: (process.env.ADMIN_JWT_SECRET ?? "changeme").trim(),
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
};

const hasDbUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.POSTGRES_URL;
if (!hasDbUrl) {
  // eslint-disable-next-line no-console
  console.warn("DATABASE_URL (or POSTGRES_URL) is not set. Set it in Railway → Backend → Variables. Database will not connect.");
} else {
  // eslint-disable-next-line no-console
  console.log("[env] Database URL is set.");
}

const adminSecret = (process.env.ADMIN_JWT_SECRET ?? "").trim();
if (!adminSecret || adminSecret === "changeme") {
  // eslint-disable-next-line no-console
  console.warn("[env] ADMIN_JWT_SECRET is not set or is 'changeme'. Add ADMIN_JWT_SECRET in Railway → Backend service → Variables.");
} else {
  // eslint-disable-next-line no-console
  console.log("[env] ADMIN_JWT_SECRET is set.");
}

