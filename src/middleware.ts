import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production"
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ["/login", "/signup", "/reset-password", "/api/health", "/api/me"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) return NextResponse.next();

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const role = (verified.payload as any).role as string;

    // /users route — SUPER_ADMIN only
    if (pathname.startsWith("/users") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/inventory", request.url));
    }

    return NextResponse.next();
  } catch (error: any) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
