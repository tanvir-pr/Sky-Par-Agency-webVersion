import type { Lead } from "@prisma/client";
import { runAutomation } from "@/lib/automation/triggers";
import { notifyAdmins } from "@/lib/notifications/create";
import { buildAdminUrl, buildIdempotencyKey, emitN8nEvent } from "./client";
import type { LeadEventData, N8nEventName } from "./types";

export function leadToEventData(lead: Lead): LeadEventData {
  return {
    id: lead.id,
    type: lead.type,
    status: lead.status,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    service: lead.service,
    budget: lead.budget,
    message: lead.message,
    projectType: lead.projectType,
    deadline: lead.deadline,
    requirements: lead.requirements,
    source: lead.source,
    leadScore: lead.leadScore,
    createdAt: lead.createdAt.toISOString(),
    adminUrl: buildAdminUrl(`/admin/crm/leads`),
  };
}

interface ProcessLeadOptions {
  lead: Lead;
  event: N8nEventName;
  notifyTitle: string;
  notifyBody: string;
  runAutomationTrigger?: boolean;
}

/** Central lead capture pipeline: notify admins → automation → n8n */
export async function processLeadCapture({
  lead,
  event,
  notifyTitle,
  notifyBody,
  runAutomationTrigger = true,
}: ProcessLeadOptions): Promise<void> {
  await notifyAdmins("NEW_LEAD", notifyTitle, notifyBody, { leadId: lead.id });

  if (runAutomationTrigger) {
    await runAutomation("LEAD_CREATED", { leadId: lead.id, leadName: lead.name });
  }

  await emitN8nEvent(
    event,
    "lead_management",
    leadToEventData(lead),
    buildIdempotencyKey(["lead", lead.id, event])
  );

  if (event.startsWith("form.")) {
    await emitN8nEvent(
      event,
      "website",
      leadToEventData(lead),
      buildIdempotencyKey(["website", lead.id, event])
    );
  }

  await emitN8nEvent(
    "lead.created",
    "lead_generation",
    { ...leadToEventData(lead), channel: lead.source ?? "website" },
    buildIdempotencyKey(["lead_gen", lead.id])
  );
}
