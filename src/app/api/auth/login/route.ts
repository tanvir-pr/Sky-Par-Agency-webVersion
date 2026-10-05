import { NextResponse } from "next/server";
import {
  authenticateUser,
  setAuthCookie,
} from "@/lib/auth";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { loginSchema } from "@/validations/forms";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const result = await authenticateUser(parsed.data.email, parsed.data.password);
    if (!result) {
      return jsonError("Invalid email or password", 401);
    }

    await setAuthCookie(result.token);

    const { password: _, ...userWithoutPassword } = result.user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
