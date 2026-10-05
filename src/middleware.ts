import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { isStaffRole, isClientRole } from "@/lib/rbac/role-permissions";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nexus-digital-agency-secret-key-change-in-production"
);

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  clientId?: string;
}

async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (token) {
        const payload = await verifyAuthToken(token);
        if (payload && isStaffRole(payload.role)) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const payload = await verifyAuthToken(token);
    if (!payload || !isStaffRole(payload.role)) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("auth-token");
      return response;
    }

    return NextResponse.next();
  }

  // Client portal routes
  if (pathname.startsWith("/portal")) {
    if (pathname === "/portal/login") {
      if (token) {
        const payload = await verifyAuthToken(token);
        if (payload && isClientRole(payload.role)) {
          return NextResponse.redirect(new URL("/portal", request.url));
        }
      }
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }

    const payload = await verifyAuthToken(token);
    if (!payload || !isClientRole(payload.role)) {
      const response = NextResponse.redirect(new URL("/portal/login", request.url));
      response.cookies.delete("auth-token");
      return response;
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
