"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { CreditCard, Download, Loader2 } from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState({ totalOutstanding: 0, totalPaid: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(() => {
    setLoading(true);
    axios
      .get("/api/portal/invoices")
      .then((res) => {
        setInvoices(res.data.invoices);
        setSummary(res.data.summary);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInvoices();
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid")) {
      toast.success(`Payment received for invoice ${params.get("paid")}`);
      window.history.replaceState({}, "", "/portal/invoices");
    } else if (params.get("cancelled")) {
      toast.info("Payment cancelled");
      window.history.replaceState({}, "", "/portal/invoices");
    }
  }, [fetchInvoices]);

  const handlePay = async (invoice: Invoice) => {
    setPayingId(invoice.id);
    try {
      const res = await axios.post(`/api/portal/invoices/${invoice.id}/pay`);
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Could not start payment");
      }
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error
        : "Payment could not be started";
      toast.error(msg || "Payment could not be started");
    } finally {
      setPayingId(null);
    }
  };

  const columns: Column<Invoice>[] = [
    { key: "invoiceNumber", header: "Invoice #", cell: (i) => <span className="font-medium">{i.invoiceNumber}</span> },
    {
      key: "status",
      header: "Status",
      cell: (i) => (
        <Badge variant="outline" className={statusColors[i.status] || ""}>
          {i.status}
        </Badge>
      ),
    },
    { key: "total", header: "Amount", cell: (i) => `$${i.total.toFixed(2)}` },
    {
      key: "dueDate",
      header: "Due Date",
      cell: (i) => (i.dueDate ? formatDate(i.dueDate) : "—"),
    },
    {
      key: "actions",
      header: "",
      cell: (i) => {
        const payable = i.status === "SENT" || i.status === "OVERDUE";
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href={`/api/invoices/${i.id}/pdf`} target="_blank" rel="noreferrer">
                <Download className="mr-1 h-3 w-3" /> PDF
              </a>
            </Button>
            {payable && (
              <Button size="sm" onClick={() => handlePay(i)} disabled={payingId === i.id} className="gap-1">
                {payingId === i.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CreditCard className="h-3 w-3" />
                )}
                Pay Now
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PortalHeader title="Invoices" description="View and track your invoices" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold">${summary.totalOutstanding.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold">${summary.totalPaid.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending Invoices</p>
              <p className="text-2xl font-bold">{summary.pending}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={invoices}
              loading={loading}
              getRowKey={(i) => i.id}
              className="border-0"
              emptyMessage="No invoices yet"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
