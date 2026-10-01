import type { N8nCategory } from "./types";

function env(key: string, fallback = ""): string {
  return process.env[key]?.trim() || fallback;
}

export const n8nConfig = {
  enabled: env("N8N_ENABLED", "false") === "true",
  baseUrl: env("N8N_BASE_URL", "http://localhost:5678").replace(/\/$/, ""),
  webhookSecret: env("N8N_WEBHOOK_SECRET"),
  apiKey: env("N8N_API_KEY"),
  siteUrl: env("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, ""),
  cronSecret: env("CRON_SECRET"),
  /** Master router — all events if category URL not set */
  masterPath: env("N8N_WEBHOOK_MASTER", "/webhook/agency-automation"),
  categoryPaths: {
    website: env("N8N_WEBHOOK_WEBSITE", ""),
    lead_management: env("N8N_WEBHOOK_LEAD", ""),
    lead_generation: env("N8N_WEBHOOK_LEAD_GEN", ""),
    client_onboarding: env("N8N_WEBHOOK_ONBOARDING", ""),
    sales: env("N8N_WEBHOOK_SALES", ""),
    project: env("N8N_WEBHOOK_PROJECT", ""),
    communication: env("N8N_WEBHOOK_COMMUNICATION", ""),
    ai: env("N8N_WEBHOOK_AI", ""),
    marketing: env("N8N_WEBHOOK_MARKETING", ""),
    support: env("N8N_WEBHOOK_SUPPORT", ""),
    finance: env("N8N_WEBHOOK_FINANCE", ""),
    files: env("N8N_WEBHOOK_FILES", ""),
    hr: env("N8N_WEBHOOK_HR", ""),
    monitoring: env("N8N_WEBHOOK_MONITORING", ""),
  } satisfies Record<N8nCategory, string>,
};

export function getWebhookUrl(category: N8nCategory): string | null {
  if (!n8nConfig.enabled) return null;
  const categoryPath = n8nConfig.categoryPaths[category];
  const path = categoryPath || n8nConfig.masterPath;
  if (!path) return null;
  return `${n8nConfig.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
