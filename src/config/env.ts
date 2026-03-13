import dotenv from "dotenv";

dotenv.config();

// Railway and some hosts use DATABASE_URL; Railway also exposes DATABASE_PUBLIC_URL / DATABASE_PRIVATE_URL
const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  "";

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl,
  clerkJwtAudience: process.env.CLERK_JWT_AUDIENCE ?? "",
  clerkJwtIssuer: process.env.CLERK_JWT_ISSUER ?? "",
  adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? "changeme",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
};

if (!env.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "[env] DATABASE_URL is not set. Set it in Railway Variables (or use reference: ${{Postgres.DATABASE_URL}}). Prisma will fail to connect."
  );
} else {
  // eslint-disable-next-line no-console
  console.log("[env] DATABASE_URL is set.");
}

