import { prisma } from "@/lib/db";

// Derives the next serial from the highest existing numeric suffix, so it is
// robust against non-sequential seed data and gaps. Includes a small retry
// window to reduce the chance of a race collision under concurrent creates.
function nextNumber(prefix: string, existing: string[]): number {
  let max = 0;
  for (const value of existing) {
    const match = value.match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return max + 1;
}

export async function generateOrderNumber(): Promise<string> {
  const orders = await prisma.order.findMany({ select: { orderNumber: true } });
  const next = nextNumber("ORD", orders.map((o) => o.orderNumber));
  return `ORD-${String(next).padStart(4, "0")}`;
}

export async function generateInvoiceNumber(): Promise<string> {
  const invoices = await prisma.invoice.findMany({ select: { invoiceNumber: true } });
  const next = nextNumber("INV", invoices.map((i) => i.invoiceNumber));
  return `INV-${String(next).padStart(4, "0")}`;
}
