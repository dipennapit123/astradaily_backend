import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  clerkJwtAudience: process.env.CLERK_JWT_AUDIENCE ?? "",
  clerkJwtIssuer: process.env.CLERK_JWT_ISSUER ?? "",
  adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? "changeme",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
};

if (!env.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn("[env] DATABASE_URL is not set. Prisma will fail to connect.");
}

