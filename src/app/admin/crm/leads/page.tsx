"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Eye, LayoutGrid, List, Search, Star, Target, TrendingUp, UserPlus } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { CrmNav } from "@/components/admin/crm/crm-nav";
import { LeadPipeline } from "@/components/admin/crm/lead-pipeline";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LEAD_STATUSES,
  LEAD_STATUS_CONFIG,
  formatLeadStatus,
  leadScoreColor,
  type LeadStatus,
} from "@/lib/crm-status";
import { cn, formatDate, truncate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  budget: string | null;
  type: string;
  status: string;
  leadScore: number;
  source: string | null;
  followUpAt: string | null;
  message: string | null;
  createdAt: string;
  assignedToId: string | null;
  assignedTo: AdminUser | null;
}

export default function CrmLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pipeline" | "table">("pipeline");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await axios.get("/api/leads", { params });
      setLeads(res.data.leads ?? []);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    axios.get("/api/users").then((res) => setUsers(res.data.users)).catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.service?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  const stats = useMemo(() => {
    const won = leads.filter((l) => l.status === "WON").length;
    const hot = leads.filter((l) => l.leadScore >= 70).length;
    const avgScore =
      leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.leadScore, 0) / leads.length) : 0;
    return {
      total: leads.length,
      active: leads.filter((l) => !["WON", "LOST"].includes(l.status)).length,
      won,
      hot,
      avgScore,
    };
  }, [leads]);

  const updateLead = async (id: string, data: Record<string, unknown>) => {
    setUpdatingId(id);
    try {
      const res = await axios.patch(`/api/leads/${id}`, data);
      setLeads((prev) => prev.map((lead) => (lead.id === id ? res.data.lead : lead)));
      if (selectedLead?.id === id) setSelectedLead(res.data.lead);
      toast.success("Lead updated");
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <AdminHeader title="Leads" description="Manage and track all incoming leads" />
      <div className="flex-1 overflow-y-auto p-6">
        <CrmNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="sky" title="Total Leads" value={loading ? "—" : stats.total} icon={UserPlus} />
          <StatCard accent="indigo" title="Active" value={loading ? "—" : stats.active} description="In pipeline" icon={Target} />
          <StatCard accent="emerald" title="Won" value={loading ? "—" : stats.won} icon={TrendingUp} />
          <StatCard accent="amber" title="Avg Score" value={loading ? "—" : stats.avgScore} description={`${stats.hot} hot leads`} icon={Star} />
        </div>

        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {view === "table" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {LEAD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{formatLeadStatus(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex rounded-lg border p-1">
              <Button variant={view === "pipeline" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("pipeline")}>
                <LayoutGrid className="h-4 w-4" /> Pipeline
              </Button>
              <Button variant={view === "table" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("table")}>
                <List className="h-4 w-4" /> Table
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading leads...</div>
        ) : view === "pipeline" ? (
          <LeadPipeline
            leads={filtered}
            onStatusChange={(id, status) => updateLead(id, { status })}
            onSelect={(lead) => {
              const full = filtered.find((l) => l.id === lead.id);
              if (full) setSelectedLead(full);
            }}
            updatingId={updatingId}
          />
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">No leads found</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead) => {
              const cfg = LEAD_STATUS_CONFIG[lead.status as LeadStatus];
              return (
                <Card key={lead.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-[160px] flex-1">
                      <p className="font-semibold">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                      {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                    </div>
                    <span className={cn("text-lg font-bold", leadScoreColor(lead.leadScore))}>{lead.leadScore}</span>
                    {lead.source && <Badge variant="outline">{lead.source}</Badge>}
                    <Badge variant="outline" className={cn(cfg?.bg, cfg?.color, cfg?.border)}>{formatLeadStatus(lead.status)}</Badge>
                    <Select value={lead.status} onValueChange={(v) => updateLead(lead.id, { status: v })} disabled={updatingId === lead.id}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{formatLeadStatus(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {lead.message && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                        <Eye className="mr-1 h-3 w-3" />
                        {truncate(lead.message, 20)}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedLead?.name}</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn(LEAD_STATUS_CONFIG[selectedLead.status as LeadStatus]?.bg, LEAD_STATUS_CONFIG[selectedLead.status as LeadStatus]?.color)}>
                    {formatLeadStatus(selectedLead.status)}
                  </Badge>
                  {selectedLead.source && <Badge variant="outline">Source: {selectedLead.source}</Badge>}
                  <Badge variant="secondary">Score: {selectedLead.leadScore}</Badge>
                  {selectedLead.type && <Badge variant="outline">{selectedLead.type}</Badge>}
                </div>
                <p><span className="font-medium">Email:</span> {selectedLead.email}</p>
                {selectedLead.phone && <p><span className="font-medium">Phone:</span> {selectedLead.phone}</p>}
                {selectedLead.company && <p><span className="font-medium">Company:</span> {selectedLead.company}</p>}
                {selectedLead.service && <p><span className="font-medium">Service:</span> {selectedLead.service}</p>}
                {selectedLead.budget && <p><span className="font-medium">Budget:</span> {selectedLead.budget}</p>}
                {selectedLead.followUpAt && <p><span className="font-medium">Follow-up:</span> {formatDate(selectedLead.followUpAt)}</p>}
                {selectedLead.assignedTo && <p><span className="font-medium">Assigned:</span> {selectedLead.assignedTo.name}</p>}
                {selectedLead.message && (
                  <div>
                    <p className="mb-1 font-medium">Message</p>
                    <p className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-muted-foreground">{selectedLead.message}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Select value={selectedLead.assignedToId || "none"} onValueChange={(v) => updateLead(selectedLead.id, { assignedToId: v === "none" ? null : v })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Assign to" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
