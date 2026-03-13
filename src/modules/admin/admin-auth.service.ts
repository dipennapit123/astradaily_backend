import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../utils/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../middlewares/errorHandler";

export const loginAdmin = async (email: string, password: string) => {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const token = jwt.sign(
    { adminId: admin.id, role: admin.role },
    env.adminJwtSecret,
    { expiresIn: "7d" },
  );

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

