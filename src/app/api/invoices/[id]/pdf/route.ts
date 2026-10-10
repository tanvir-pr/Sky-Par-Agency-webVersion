import { NextResponse } from "next/server";
import { getSession, getUserFromSession } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac/permissions";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, payments: true },
    });

    if (!invoice) return jsonError("Invoice not found", 404);

    // Allow staff with invoices:read OR the owning client
    const user = await getUserFromSession();
    if (!user) return jsonError("Unauthorized", 401);
    const isOwningClient = user.role === "CLIENT" && user.clientId === invoice.clientId;
    const isStaff = hasPermission(user.role, "invoices:read");
    if (!isOwningClient && !isStaff) return jsonError("Forbidden", 403);

    const lineItems = invoice.lineItems as { description: string; amount: number; qty?: number }[];

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invoice ${invoice.invoiceNumber}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #333; }
  h1 { color: #4f46e5; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
  th { background: #f5f5f5; }
  .total { font-size: 1.2em; font-weight: bold; text-align: right; }
</style>
</head>
<body>
  <h1>INVOICE</h1>
  <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
  <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
  <p><strong>Due:</strong> ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Upon receipt"}</p>
  <hr>
  <p><strong>Bill To:</strong><br>${invoice.client.name}<br>${invoice.client.email}${invoice.client.company ? `<br>${invoice.client.company}` : ""}</p>
  <table>
    <thead><tr><th>Description</th><th>Qty</th><th>Amount</th></tr></thead>
    <tbody>
      ${lineItems.map((item) => `<tr><td>${item.description}</td><td>${item.qty ?? 1}</td><td>$${item.amount.toFixed(2)}</td></tr>`).join("")}
    </tbody>
  </table>
  <p class="total">Subtotal: $${invoice.subtotal.toFixed(2)}</p>
  ${invoice.tax > 0 ? `<p class="total">Tax: $${invoice.tax.toFixed(2)}</p>` : ""}
  <p class="total">Total: $${invoice.total.toFixed(2)}</p>
  <p><strong>Status:</strong> ${invoice.status}</p>
  ${invoice.notes ? `<p><em>${invoice.notes}</em></p>` : ""}
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.html"`,
      },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
