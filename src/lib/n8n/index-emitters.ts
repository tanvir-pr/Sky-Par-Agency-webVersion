import type { Client, Invoice, Order, Project } from "@prisma/client";
import { buildAdminUrl, buildIdempotencyKey, emitN8nEvent } from "./client";
import type { ClientEventData, InvoiceEventData, OrderEventData } from "./types";

export async function emitClientCreated(
  client: Client,
  hasPortalUser = false
): Promise<void> {
  const data: ClientEventData = {
    id: client.id,
    name: client.name,
    email: client.email,
    company: client.company,
    phone: client.phone,
    hasPortalUser,
    adminUrl: buildAdminUrl(`/admin/crm/clients/${client.id}`),
  };

  await emitN8nEvent(
    "client.created",
    "client_onboarding",
    data,
    buildIdempotencyKey(["client", client.id])
  );

  await emitN8nEvent(
    "client.onboarding.started",
    "client_onboarding",
    data,
    buildIdempotencyKey(["onboarding", client.id])
  );
}

export async function emitOrderAccepted(
  order: Order & {
    client: { id: string; name: string; email: string };
    package?: { id: string; name: string; category?: { slug: string } | null } | null;
    project?: { id: string; title: string } | null;
  }
): Promise<void> {
  const data: OrderEventData = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    price: Number(order.price),
    client: order.client,
    package: order.package
      ? {
          id: order.package.id,
          name: order.package.name,
          categorySlug: order.package.category?.slug,
        }
      : undefined,
    project: order.project,
    adminUrl: buildAdminUrl(`/admin/orders/${order.id}`),
  };

  await emitN8nEvent("order.accepted", "sales", data, buildIdempotencyKey(["order_accepted", order.id]));
  await emitN8nEvent("order.accepted", "project", data, buildIdempotencyKey(["project_order", order.id]));
}

export async function emitProjectCreated(project: Project): Promise<void> {
  await emitN8nEvent(
    "project.created",
    "project",
    {
      id: project.id,
      title: project.title,
      status: project.status,
      clientId: project.clientId,
      orderId: project.orderId,
      adminUrl: buildAdminUrl(`/admin/projects/${project.id}`),
    },
    buildIdempotencyKey(["project", project.id])
  );
}

export async function emitInvoiceEvent(
  invoice: Invoice & { client?: { name: string } | null },
  event: "invoice.created" | "invoice.sent" | "invoice.paid" | "invoice.overdue"
): Promise<void> {
  const data: InvoiceEventData = {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    total: Number(invoice.total),
    clientId: invoice.clientId,
    clientName: invoice.client?.name,
    dueDate: invoice.dueDate?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
    adminUrl: buildAdminUrl(`/admin/finance/invoices/${invoice.id}`),
  };

  await emitN8nEvent(event, "finance", data, buildIdempotencyKey(["invoice", invoice.id, event]));
}

export async function emitPaymentReceived(data: {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  method: string;
  reference?: string | null;
  clientName?: string;
}): Promise<void> {
  await emitN8nEvent(
    "payment.received",
    "finance",
    { ...data, adminUrl: buildAdminUrl(`/admin/finance/invoices/${data.invoiceId}`) },
    buildIdempotencyKey(["payment", data.invoiceId, data.reference ?? ""])
  );
}

export async function emitLeadWon(data: {
  leadId: string;
  stripeSessionId?: string;
  amountPaid?: number;
  currency?: string;
  service?: string;
  customer: { name: string; email: string; phone?: string | null };
}): Promise<void> {
  await emitN8nEvent("lead.won", "lead_management", data, buildIdempotencyKey(["lead_won", data.leadId]));
  await emitN8nEvent("lead.won", "sales", data, buildIdempotencyKey(["sales_lead_won", data.leadId]));
}

export async function emitApplicationReceived(data: {
  id: string;
  name: string;
  email: string;
  careerTitle: string;
  careerId: string;
}): Promise<void> {
  await emitN8nEvent(
    "application.received",
    "hr",
    { ...data, adminUrl: buildAdminUrl("/admin/careers") },
    buildIdempotencyKey(["application", data.id])
  );
}
