import type { Request, Response } from "express";
import { z } from "zod";
import { loginAdmin } from "./admin-auth.service";
import { ApiError } from "../../middlewares/errorHandler";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

