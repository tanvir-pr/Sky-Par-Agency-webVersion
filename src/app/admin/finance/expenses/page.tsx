"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Receipt, Search, Tag } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Input } from "@/components/ui/input";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_CONFIG,
  formatCurrency,
} from "@/lib/finance-status";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  user: { name: string } | null;
}


const emptyForm = {
  title: "",
  amount: "",
  category: "OTHER",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (categoryFilter !== "all") params.category = categoryFilter;
      const res = await axios.get("/api/expenses", { params });
      setExpenses(res.data.expenses ?? []);
    } catch {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleCreate = async () => {
    if (!form.title || !form.amount) {
      toast.error("Title and amount are required");
      return;
    }
    setSaving(true);
    try {
      await axios.post("/api/expenses", {
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        description: form.description || undefined,
        date: form.date,
      });
      toast.success("Expense recorded");
      setDialogOpen(false);
      setForm(emptyForm);
      fetchExpenses();
    } catch {
      toast.error("Failed to create expense");
    } finally {
      setSaving(false);
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const filtered = search.trim()
    ? expenses.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
    : expenses;
  const topCategory = EXPENSE_CATEGORIES.reduce(
    (best, cat) => {
      const sum = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
      return sum > best.sum ? { cat, sum } : best;
    },
    { cat: "OTHER", sum: 0 }
  );

  const columns: Column<Expense>[] = [
    {
      key: "title",
      header: "Expense",
      cell: (e) => (
        <div>
          <p className="font-medium">{e.title}</p>
          {e.description && (
            <p className="text-xs text-muted-foreground">{e.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (e) => (
        <Badge variant="outline" className={cn(EXPENSE_CATEGORY_CONFIG[e.category]?.bg, EXPENSE_CATEGORY_CONFIG[e.category]?.color)}>
          {EXPENSE_CATEGORY_CONFIG[e.category]?.label ?? e.category}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (e) => formatCurrency(e.amount),
    },
    {
      key: "user",
      header: "Recorded By",
      cell: (e) => e.user?.name || "—",
    },
    {
      key: "date",
      header: "Date",
      cell: (e) => formatDate(e.date),
    },
  ];

  return (
    <>
      <AdminHeader title="Expenses" description="Track agency expenses" />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="rose" title="Total Expenses" value={loading ? "—" : formatCurrency(total)} icon={Receipt} />
          <StatCard accent="indigo" title="Entries" value={loading ? "—" : expenses.length} icon={Tag} />
          <StatCard accent="violet" title="Top Category" value={loading ? "—" : EXPENSE_CATEGORY_CONFIG[topCategory.cat]?.label ?? "—"} description={loading ? undefined : formatCurrency(topCategory.sum)} icon={Tag} />
          <StatCard accent="amber" title="This Month" value={loading ? "—" : formatCurrency(total)} description="All recorded" icon={Receipt} />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Card className="flex-1 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative min-w-[180px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <span className="text-sm font-medium">Category:</span>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {EXPENSE_CATEGORY_CONFIG[c]?.label ?? c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-auto text-sm text-muted-foreground">
                {filtered.length} expense{filtered.length !== 1 ? "s" : ""}
              </span>
            </CardContent>
          </Card>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          getRowKey={(e) => e.id}
          emptyMessage="No expenses recorded"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {EXPENSE_CATEGORY_CONFIG[c]?.label ?? c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "Saving..." : "Save Expense"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
