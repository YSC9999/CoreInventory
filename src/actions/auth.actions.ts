"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateOTP, storeOTP, verifyOTP, sendVerificationEmail } from "@/lib/email";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

// ─── Invite Code → Role mapping ────────────────────────────────────────────
const SUPER_ADMIN_EMAIL = "baluduvamsi2000@gmail.com";
const INVITE_CODE_MANAGER = process.env.INVITE_CODE_MANAGER || "MGR-CORE-2026";
const INVITE_CODE_STAFF = process.env.INVITE_CODE_STAFF || "STAFF-INV-2026";

function getRoleFromInviteCode(email: string, inviteCode: string): string | null {
  if (email.toLowerCase() === SUPER_ADMIN_EMAIL) return "SUPER_ADMIN";
  if (inviteCode === INVITE_CODE_MANAGER) return "MANAGER";
  if (inviteCode === INVITE_CODE_STAFF) return "WAREHOUSE_STAFF";
  return null;
}

// ─── Validation schemas ─────────────────────────────────────────────────────
const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  inviteCode: z.string().min(1, "Invitation code is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Step 1: Initiate signup — validate invite code and send OTP ───────────
export async function initiateSignup(formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
}) {
  try {
    const validated = SignupSchema.parse(formData);

    // Check role from invite code
    const role = getRoleFromInviteCode(validated.email, validated.inviteCode);
    if (!role) {
      return { success: false, error: "Invalid invitation code. Please contact your administrator." };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (existingUser) {
      return { success: false, error: "Email already registered. Please login instead." };
    }

    // Generate and send OTP
    const otp = generateOTP();
    storeOTP(validated.email, otp, role, validated.inviteCode);

    try {
      await sendVerificationEmail(validated.email, otp, role);
      return { success: true, emailSent: true };
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError.message);
      // Still allow signup in dev mode — return otp for fallback
      return { success: true, emailSent: false, devOtp: otp };
    }
  } catch (error: any) {
    console.error("InitiateSignup error:", error);
    if (error?.name === "ZodError") {
      return { success: false, error: error.errors[0]?.message || "Validation failed" };
    }
    return { success: false, error: error.message || "Failed to initiate signup" };
  }
}

// ─── Step 2: Verify OTP and create account ─────────────────────────────────
export async function verifyAndCreateAccount(formData: {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
  otp: string;
}) {
  try {
    // Verify OTP
    const otpResult = verifyOTP(formData.email, formData.otp);
    if (!otpResult.valid) {
      return { success: false, error: otpResult.error || "Invalid verification code" };
    }

    const role = otpResult.role!;

    // Hash password
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    // Get or create organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: "CoreInventory Organization",
          inviteCode: `ORG-${Date.now()}`,
        },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: formData.email,
        name: formData.name,
        password: hashedPassword,
        organizationId: org.id,
        role,
        verified: true,
      },
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  } catch (error: any) {
    console.error("VerifyAndCreate error:", error);
    return { success: false, error: error.message || "Account creation failed" };
  }
}

// ─── Keep original signUp for backward compat (wraps new flow) ─────────────
export async function signUp(formData: any) {
  return { success: false, error: "Please use the new signup flow" };
}

// ─── Login ────────────────────────────────────────────────────────────────
export async function logIn(formData: any) {
  try {
    const validated = LoginSchema.parse(formData);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) return { success: false, error: "Invalid email or password" };

    const passwordMatch = await bcrypt.compare(validated.password, user.password);
    if (!passwordMatch) return { success: false, error: "Invalid email or password" };

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message || "Login failed" };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────
export async function logOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Logout failed" };
  }
}

// ─── Get current user ─────────────────────────────────────────────────────
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    return user;
  } catch {
    return null;
  }
}
