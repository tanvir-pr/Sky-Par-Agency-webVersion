import { prisma } from "@/lib/db";
import { createNotification, notifyAdmins } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email";
import { createProjectFromOrder } from "@/lib/orders/create-project";
import { buildIdempotencyKey, emitN8nEvent } from "@/lib/n8n";
import type { AutomationTrigger } from "@prisma/client";

export async function runAutomation(trigger: AutomationTrigger, data: Record<string, unknown>) {
  const rules = await prisma.automationRule.findMany({
    where: { trigger, active: true },
  });

  for (const rule of rules) {
    switch (rule.action) {
      case "ASSIGN_LEAD": {
        if (trigger === "LEAD_CREATED" && data.leadId) {
          const salesUsers = await prisma.user.findMany({
            where: { role: "SALES_MANAGER", status: "ACTIVE" },
          });
          if (salesUsers.length > 0) {
            const assignee = salesUsers[Math.floor(Math.random() * salesUsers.length)];
            await prisma.lead.update({
              where: { id: data.leadId as string },
              data: { assignedToId: assignee.id },
            });
            await createNotification({
              userId: assignee.id,
              type: "NEW_LEAD",
              title: "New lead assigned",
              body: `Lead ${data.leadName} has been assigned to you`,
            });
          }
        }
        break;
      }
      case "SEND_EMAIL": {
        if (trigger === "CLIENT_CREATED" && data.clientEmail) {
          await sendEmail({
            to: data.clientEmail as string,
            subject: "Welcome to Nexus Digital",
            html: `<p>Hi ${data.clientName},</p><p>Welcome to Nexus Digital! Your client portal is ready.</p>`,
          });
        }
        if (trigger === "CONTRACT_EXPIRING" && data.clientEmail) {
          await sendEmail({
            to: data.clientEmail as string,
            subject: "Contract Renewal Reminder",
            html: `<p>Your contract "${data.contractTitle}" is expiring soon. Please contact us to renew.</p>`,
          });
        }
        break;
      }
      case "CREATE_TASK": {
        if (trigger === "ORDER_ACCEPTED" && data.orderId) {
          await createProjectFromOrder(data.orderId as string);
        }
        break;
      }
      case "SEND_NOTIFICATION": {
        if (trigger === "INVOICE_OVERDUE") {
          await notifyAdmins("INVOICE_REMINDER", "Overdue Invoice", `Invoice ${data.invoiceNumber} is overdue`);
        }
        break;
      }
    }
  }
}

export async function checkContractRenewals() {
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const expiring = await prisma.contract.findMany({
    where: {
      renewalDate: { lte: thirtyDays, gte: new Date() },
      status: { in: ["SIGNED", "RENEWED"] },
    },
    include: { client: true },
  });

  for (const contract of expiring) {
    await runAutomation("CONTRACT_EXPIRING", {
      contractTitle: contract.title,
      clientEmail: contract.client.email,
      clientName: contract.client.name,
    });
    await emitN8nEvent(
      "contract.expiring",
      "sales",
      {
        contractId: contract.id,
        title: contract.title,
        clientEmail: contract.client.email,
        renewalDate: contract.renewalDate?.toISOString(),
      },
      buildIdempotencyKey(["contract_expiring", contract.id])
    );
  }
}

export async function checkOverdueInvoices() {
  const overdue = await prisma.invoice.findMany({
    where: {
      status: "SENT",
      dueDate: { lt: new Date() },
    },
  });

  for (const invoice of overdue) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "OVERDUE" },
    });
    await runAutomation("INVOICE_OVERDUE", {
      invoiceNumber: invoice.invoiceNumber,
      invoiceId: invoice.id,
    });
    await emitN8nEvent(
      "invoice.overdue",
      "finance",
      {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: Number(invoice.total),
        clientId: invoice.clientId,
      },
      buildIdempotencyKey(["invoice_overdue", invoice.id])
    );
  }
}
