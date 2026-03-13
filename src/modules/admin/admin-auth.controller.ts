import type { Request, Response } from "express";
import { z } from "zod";
import { loginAdmin, setupFirstAdmin } from "./admin-auth.service";
import { ApiError } from "../../middlewares/errorHandler";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export const adminLoginHandler = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid login payload.");
  }

  const { email, password } = parsed.data;
  const { token, admin } = await loginAdmin(email, password);

  res.json({ success: true, data: { token, admin } });
};

/** One-time setup: create first admin when database has no admins (e.g. new Railway deploy). */
export const adminSetupHandler = async (req: Request, res: Response) => {
  const parsed = setupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid setup payload. Need email and password (min 6 chars).");
  }

  const { email, password, name } = parsed.data;
  const { token, admin } = await setupFirstAdmin(email, password, name ?? "Admin");

  res.json({ success: true, data: { token, admin } });
};

