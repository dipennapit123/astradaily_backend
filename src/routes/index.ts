import { Router } from "express";
import { userRouter } from "../modules/user/user.routes";
import { horoscopeRouter } from "../modules/horoscope/horoscope.routes";
import { adminAuthRouter } from "../modules/admin/admin-auth.routes";
import { adminHoroscopeRouter } from "../modules/admin/admin-horoscope.routes";
import { adminUsersRouter } from "../modules/admin/admin-users.routes";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

router.use("/users", userRouter);
router.use("/horoscopes", horoscopeRouter);
router.use("/admin/auth", adminAuthRouter);
router.use("/admin/horoscopes", adminHoroscopeRouter);
router.use("/admin/users", adminUsersRouter);

