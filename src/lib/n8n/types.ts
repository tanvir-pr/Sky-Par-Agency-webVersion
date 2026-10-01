/** Agency automation event categories aligned with n8n workflow folders */
export type N8nCategory =
  | "website"
  | "lead_management"
  | "lead_generation"
  | "client_onboarding"
  | "sales"
  | "project"
  | "communication"
  | "ai"
  | "marketing"
  | "support"
  | "finance"
  | "files"
  | "hr"
  | "monitoring";

export type N8nEventName =
  // Website
  | "form.contact"
  | "form.inquiry"
  | "form.audit"
  | "form.newsletter"
  | "form.quote"
  | "form.support"
  | "form.booking"
  | "form.checkout"
  | "form.application"
  | "chat.message"
  // Lead management
  | "lead.created"
  | "lead.updated"
  | "lead.qualified"
  | "lead.assigned"
  | "lead.won"
  | "lead.lost"
  | "lead.nurture"
  // Client onboarding
  | "client.created"
  | "client.onboarding.started"
  | "client.portal.ready"
  // Sales
  | "proposal.created"
  | "proposal.sent"
  | "contract.created"
  | "contract.signed"
  | "contract.expiring"
  // Orders & projects
  | "order.created"
  | "order.accepted"
  | "order.completed"
  | "project.created"
  | "project.completed"
  | "task.created"
  | "task.overdue"
  // Finance
  | "invoice.created"
  | "invoice.sent"
  | "invoice.paid"
  | "invoice.overdue"
  | "payment.received"
  // Support & HR
  | "support.ticket.created"
  | "application.received"
  | "consultation.booked"
  // Marketing
  | "newsletter.subscribed"
  // Monitoring
  | "workflow.error"
  | "automation.check";

export interface N8nEventEnvelope<T = Record<string, unknown>> {
  event: N8nEventName;
  category: N8nCategory;
  timestamp: string;
  source: "nexus-digital-agency";
  idempotencyKey: string;
  siteUrl: string;
  data: T;
}

export interface LeadEventData {
  id: string;
  type: string;
  status: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message?: string | null;
  projectType?: string | null;
  deadline?: string | null;
  requirements?: string | null;
  source?: string | null;
  leadScore?: number;
  createdAt: string;
  adminUrl: string;
}

export interface ClientEventData {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  hasPortalUser?: boolean;
  adminUrl: string;
}

export interface OrderEventData {
  id: string;
  orderNumber: string;
  status: string;
  price: number;
  client: { id: string; name: string; email: string };
  package?: { id: string; name: string; categorySlug?: string };
  project?: { id: string; title: string } | null;
  adminUrl: string;
}

export interface InvoiceEventData {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  clientId: string;
  clientName?: string;
  dueDate?: string | null;
  paidAt?: string | null;
  adminUrl: string;
}

export interface SupportTicketData {
  leadId: string;
  subject: string;
  priority: string;
  name: string;
  email: string;
  message: string;
  adminUrl: string;
}

export interface ConsultationBookedData {
  name: string;
  email: string;
  phone?: string | null;
  scheduledAt: string;
  timezone?: string | null;
  eventType?: string | null;
  calendlyEventUri?: string | null;
  leadId?: string;
}

/** Inbound actions n8n can call back on /api/webhooks/n8n */
export type N8nInboundAction =
  | "lead.update"
  | "lead.assign"
  | "lead.qualify"
  | "client.create_from_lead"
  | "task.create"
  | "meeting.create"
  | "notification.admin"
  | "project.create_from_order";

export interface N8nInboundPayload {
  action: N8nInboundAction;
  payload: Record<string, unknown>;
}
