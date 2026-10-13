import { NextResponse } from "next/server";
import { checkContractRenewals, checkOverdueInvoices } from "@/lib/automation/triggers";
import { jsonError } from "@/lib/api-utils";
import { emitN8nEvent, buildIdempotencyKey } from "@/lib/n8n";
import { verifyCronSecret } from "@/lib/n8n/verify";

/** Scheduled automation checks — call via cron or n8n Schedule Trigger */
export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return jsonError("Unauthorized", 401);
  }

  try {
    await checkContractRenewals();
    await checkOverdueInvoices();

    await emitN8nEvent(
      "automation.check",
      "monitoring",
      { checks: ["contract_renewals", "overdue_invoices"], ranAt: new Date().toISOString() },
      buildIdempotencyKey(["cron", new Date().toISOString().slice(0, 13)])
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[cron/automation]", error);
    return jsonError("Automation check failed", 500);
  }
}

export async function POST(request: Request) {
  return GET(request);
}
