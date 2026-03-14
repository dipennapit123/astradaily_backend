import { Router } from "express";
import { ping } from "../db";
import { userRouter } from "../modules/user/user.routes";
import { horoscopeRouter } from "../modules/horoscope/horoscope.routes";
import { adminHoroscopeRouter } from "../modules/admin/admin-horoscope.routes";
import { adminUsersRouter } from "../modules/admin/admin-users.routes";

export const router = Router();

/** Health check: verifies API and DB. GET /api/health — when database is "connected", user data is available. */
router.get("/health", async (_req, res) => {
  let database: "connected" | "disconnected" = "disconnected";
  try {
    await ping();
    database = "connected";
  } catch {
    // leave database as disconnected
  }
  res.json({
    success: true,
    data: {
      status: "ok",
      database,
      message:
        database === "connected"
          ? "Database connected; horoscopes and user data will be served."
          : "Database not connected; set DATABASE_URL and ensure Postgres is running.",
    },
  });
});

router.use("/users", userRouter);
router.use("/horoscopes", horoscopeRouter);
router.use("/admin/horoscopes", adminHoroscopeRouter);
router.use("/admin/users", adminUsersRouter);

