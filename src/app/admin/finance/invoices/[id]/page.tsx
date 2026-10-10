"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LineItem {
  description: string;
  amount: number;
  qty?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string | null;
  pdfUrl: string | null;
  notes: string | null;
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string; company: string | null; address: string | null };
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/invoices/${id}`);
      setInvoice(res.data.invoice ?? null);
    } catch {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const markPaid = async () => {
    setUpdating(true);
    try {
      const res = await axios.patch(`/api/invoices/${id}`, { status: "PAID" });
      setInvoice(res.data.invoice);
      toast.success("Invoice marked as paid");
    } catch {
      toast.error("Failed to update invoice");
    } finally {
      setUpdating(false);
    }
  };

  const sendInvoice = async () => {
    setUpdating(true);
    try {
      const res = await axios.patch(`/api/invoices/${id}`, { status: "SENT" });
      setInvoice(res.data.invoice);
      toast.success("Invoice marked as sent");
    } catch {
      toast.error("Failed to send invoice");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownload = () => {
    if (invoice?.pdfUrl) {
      window.open(invoice.pdfUrl, "_blank");
    } else {
      window.open(`/api/invoices/${id}/pdf`, "_blank");
    }
  };

  if (loading && !invoice) {
    return (
      <>
        <AdminHeader title="Invoice" description="Loading..." />
        <div className="flex flex-1 items-center justify-center p-6 text-muted-foreground">
          Loading...
        </div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <AdminHeader title="Invoice Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">This invoice could not be found.</p>
          <Button variant="outline" asChild>
            <Link href="/admin/finance/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];

  return (
    <>
      <AdminHeader
        title={invoice.invoiceNumber}
        description={`${invoice.client.company || invoice.client.name}`}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />
        <div className="mb-6 rounded-2xl border bg-gradient-to-br from-emerald-500/10 via-white to-sky-500/5 p-6 dark:from-emerald-950/30 dark:via-slate-900 dark:to-sky-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Invoice</p>
              <h2 className="text-2xl font-bold tracking-tight">{invoice.invoiceNumber}</h2>
              <p className="mt-1 text-muted-foreground">{invoice.client.company || invoice.client.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className={cn("text-sm", statusColors[invoice.status] || "")}>
                {invoice.status}
              </Badge>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/finance/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Invoices
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {invoice.status === "DRAFT" && (
            <Button size="sm" disabled={updating} onClick={sendInvoice}>
              Mark as Sent
            </Button>
          )}
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <Button size="sm" disabled={updating} onClick={markPaid}>
              Mark as Paid
            </Button>
          )}
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className={statusColors[invoice.status] || ""}>
                {invoice.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">
                {invoice.dueDate ? formatDate(invoice.dueDate) : "Not set"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Created</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{formatDate(invoice.createdAt)}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Bill To</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{invoice.client.name}</p>
            {invoice.client.company && <p>{invoice.client.company}</p>}
            <p className="text-muted-foreground">{invoice.client.email}</p>
            {invoice.client.address && (
              <p className="text-muted-foreground">{invoice.client.address}</p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.qty ?? 1}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="text-right font-medium">Subtotal</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.subtotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="text-right font-medium">Tax</TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.tax)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
