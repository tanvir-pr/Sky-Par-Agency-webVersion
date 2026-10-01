import { prisma } from "@/lib/db";
import { getTasksForCategory } from "@/lib/task-templates";
import { generateInvoiceNumber } from "@/lib/serial-numbers";
import { notifyAdmins } from "@/lib/notifications/create";

export async function createProjectFromOrder(orderId: string, creatorId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      package: { include: { category: true } },
      client: true,
      project: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.project) {
    return { project: order.project, invoice: null, created: false };
  }

  const categorySlug = order.package.category.slug;
  const templates = getTasksForCategory(categorySlug);

  const project = await prisma.project.create({
    data: {
      title: `${order.package.name} — ${order.client.name}`,
      clientId: order.clientId,
      packageId: order.packageId,
      orderId: order.id,
      status: "PLANNING",
      description: order.notes ?? undefined,
      tasks: {
        create: templates.map((t, i) => ({
          title: t.title,
          description: t.description,
          type: t.type,
          priority: t.priority ?? "MEDIUM",
          order: t.order ?? i,
          creatorId,
          kanbanCol: "todo",
        })),
      },
    },
    include: { tasks: true },
  });

  const invoiceNumber = await generateInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: order.clientId,
      status: "DRAFT",
      lineItems: [
        {
          description: `${order.package.name} (${order.package.category.name})`,
          amount: order.price,
          qty: 1,
        },
      ],
      subtotal: order.price,
      tax: 0,
      total: order.price,
      notes: `Invoice for order ${order.orderNumber}`,
    },
  });

  await notifyAdmins(
    "NEW_TASK",
    "New project created",
    `Project "${project.title}" was created from order ${order.orderNumber}`,
    { projectId: project.id, orderId: order.id }
  );

  return { project, invoice, created: true };
}
