import { Router } from "express";
import { prisma } from "../utils/prisma";
import { userRouter } from "../modules/user/user.routes";
import { horoscopeRouter } from "../modules/horoscope/horoscope.routes";
import { adminAuthRouter } from "../modules/admin/admin-auth.routes";
import { adminHoroscopeRouter } from "../modules/admin/admin-horoscope.routes";
import { adminUsersRouter } from "../modules/admin/admin-users.routes";

export const router = Router();

/** Health check: verifies API and optional DB connection. GET /api/health */
router.get("/health", async (_req, res) => {
  let database: "connected" | "disconnected" = "disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch {
    // leave database as disconnected
  }
  res.json({
    success: true,
    data: { status: "ok", database },
  });
});

router.use("/users", userRouter);
router.use("/horoscopes", horoscopeRouter);
router.use("/admin/auth", adminAuthRouter);
router.use("/admin/horoscopes", adminHoroscopeRouter);
router.use("/admin/users", adminUsersRouter);

