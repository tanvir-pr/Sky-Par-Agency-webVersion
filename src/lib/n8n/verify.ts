import { createHmac, timingSafeEqual } from "crypto";

export function signN8nPayload(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function verifyN8nSignature(
  body: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!secret) return false;
  if (!signature) return false;
  const expected = signN8nPayload(body, secret);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
