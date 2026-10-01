import { getWebhookUrl, n8nConfig } from "./config";
import { signN8nPayload } from "./verify";
import type { N8nCategory, N8nEventEnvelope, N8nEventName } from "./types";

export function buildIdempotencyKey(parts: string[]): string {
  return parts.filter(Boolean).join("_");
}

export function buildAdminUrl(path: string): string {
  return `${n8nConfig.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function emitN8nEvent<T extends object>(
  event: N8nEventName,
  category: N8nCategory,
  data: T,
  idempotencyKey: string
): Promise<void> {
  const url = getWebhookUrl(category);
  if (!url) return;

  const envelope: N8nEventEnvelope<T> = {
    event,
    category,
    timestamp: new Date().toISOString(),
    source: "nexus-digital-agency",
    idempotencyKey,
    siteUrl: n8nConfig.siteUrl,
    data,
  };

  const body = JSON.stringify(envelope);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-N8N-Event": event,
    "X-N8N-Category": category,
    "X-Idempotency-Key": idempotencyKey,
  };

  if (n8nConfig.webhookSecret) {
    headers["X-N8N-Signature"] = signN8nPayload(body, n8nConfig.webhookSecret);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[n8n] ${event} failed: HTTP ${res.status}`);
    }
  } catch (error) {
    console.error(`[n8n] ${event} dispatch error:`, error);
  }
}
