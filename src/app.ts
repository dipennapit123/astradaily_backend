import express from "express";
import cors from "cors";
import morgan from "morgan";
import { json } from "express";
import { router } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

export const createApp = () => {
  const app = express();

  // Set CORS on every response so browser never blocks (e.g. localhost:5173 → Railway)
  app.use((_req, res, next) => {
    const origin = _req.header("Origin");
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (_req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(morgan("dev"));
  app.use(json());

  app.use("/api", router);

  // 404 for unmatched routes (so response goes through CORS and has correct headers)
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { message: "Not found" } });
  });

  app.use(errorHandler);

  return app;
};

