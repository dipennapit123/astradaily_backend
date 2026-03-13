import express from "express";
import cors from "cors";
import morgan from "morgan";
import { json } from "express";
import { router } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: "*", credentials: true }));
  app.use(morgan("dev"));
  app.use(json());

  app.use("/api", router);

  app.use(errorHandler);

  return app;
};

