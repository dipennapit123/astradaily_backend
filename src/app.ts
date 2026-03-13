import express from "express";
import cors from "cors";
import morgan from "morgan";
import { json } from "express";
import { router } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: true, // reflect request origin (e.g. http://localhost:5173)
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

