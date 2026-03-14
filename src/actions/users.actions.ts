"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

async function getRequestingUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });
  } catch {
    return null;
  }
}

// ─── Get all users (SUPER_ADMIN + MANAGER can view) ────────────────────────
export async function getAllUsers() {
  const requester = await getRequestingUser();
  if (!requester || !["SUPER_ADMIN", "MANAGER"].includes(requester.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      verified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return { success: true, users };
}

// ─── Update user role (SUPER_ADMIN only) ──────────────────────────────────
export async function updateUserRole(userId: string, newRole: string) {
  const requester = await getRequestingUser();
  if (!requester || requester.role !== "SUPER_ADMIN") {
    return { success: false, error: "Only Super Admin can change user roles" };
  }

  const allowedRoles = ["MANAGER", "WAREHOUSE_STAFF"];
  if (!allowedRoles.includes(newRole)) {
    return { success: false, error: "Invalid role. Allowed: MANAGER, WAREHOUSE_STAFF" };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return { success: false, error: "User not found" };
  if (targetUser.role === "SUPER_ADMIN") return { success: false, error: "Cannot modify Super Admin" };

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true },
  });

  return { success: true, user: updated };
}

// ─── Delete user (SUPER_ADMIN only) ───────────────────────────────────────
export async function deleteUser(userId: string) {
  const requester = await getRequestingUser();
  if (!requester || requester.role !== "SUPER_ADMIN") {
    return { success: false, error: "Only Super Admin can delete users" };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return { success: false, error: "User not found" };
  if (targetUser.role === "SUPER_ADMIN") return { success: false, error: "Cannot delete Super Admin" };
  if (targetUser.id === requester.id) return { success: false, error: "Cannot delete yourself" };

  await prisma.user.delete({ where: { id: userId } });
  return { success: true };
}
