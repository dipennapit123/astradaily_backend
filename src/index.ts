/**
 * Vercel entry: export the Express app so Vercel runs it as a serverless function.
 * Load env first so DATABASE_URL etc. are available.
 */
import "dotenv/config";
import { createApp } from "./app";

export default createApp();
