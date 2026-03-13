import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../utils/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../middlewares/errorHandler";

/** Create the first admin when no admins exist (one-time setup for new deployments). */
export const setupFirstAdmin = async (
  email: string,
  password: string,
  name: string,
) => {
  if (!env.adminJwtSecret || env.adminJwtSecret === "changeme") {
    throw new ApiError(
      500,
      "Server misconfiguration: ADMIN_JWT_SECRET is not set. Add it in Railway Variables.",
    );
  }

  let count: number;
  try {
    count = await prisma.admin.count();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("connect") || msg.includes("Connection")) {
      throw new ApiError(503, "Database unavailable. Check DATABASE_URL in Railway.");
    }
    throw err;
  }
  if (count > 0) {
    throw new ApiError(403, "Admin already exists. Use the login page.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: {
      email,
      passwordHash,
      name: name || "Admin",
      role: "SUPER_ADMIN",
    },
  });

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

export const loginAdmin = async (email: string, password: string) => {
  if (!env.adminJwtSecret || env.adminJwtSecret === "changeme") {
    throw new ApiError(
      500,
      "Server misconfiguration: ADMIN_JWT_SECRET is not set. Add it in Railway Variables.",
    );
  }

  let admin;
  try {
    admin = await prisma.admin.findUnique({ where: { email } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("connect") || msg.includes("Connection")) {
      throw new ApiError(503, "Database unavailable. Check DATABASE_URL in Railway.");
    }
    throw err;
  }

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

