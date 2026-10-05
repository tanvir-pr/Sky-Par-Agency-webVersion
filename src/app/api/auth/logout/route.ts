import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { jsonError } from "@/lib/api-utils";

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
