"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Clock, Play, Square, Timer } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { TeamNav } from "@/components/admin/team/team-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";

interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  notes: string | null;
  task: { id: string; title: string; project?: { title: string } } | null;
}

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    axios
      .get("/api/admin/time-tracking")
      .then((res) => {
        setEntries(res.data.entries);
        setActiveEntry(res.data.activeEntry);
      })
      .catch(() => {
        setEntries([]);
        setActiveEntry(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await axios.post("/api/admin/time-tracking", { action: "start" });
      toast.success("Timer started");
      fetchData();
    } catch {
      toast.error("Failed to start timer");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    try {
      await axios.post("/api/admin/time-tracking", { action: "stop" });
      toast.success("Timer stopped");
      fetchData();
    } catch {
      toast.error("Failed to stop timer");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const totalHours = Math.round(
    entries.reduce((s, e) => s + (e.duration ?? 0), 0) / 3600
  );

  const columns: Column<TimeEntry>[] = [
    { key: "task", header: "Task", cell: (e) => e.task?.title ?? "General" },
    { key: "project", header: "Project", cell: (e) => e.task?.project?.title ?? "—" },
    { key: "startTime", header: "Start", cell: (e) => formatDate(e.startTime) },
    { key: "duration", header: "Duration", cell: (e) => formatDuration(e.duration) },
  ];

  return (
    <>
      <AdminHeader title="Time Tracking" description="Track time on tasks and projects" />
      <div className="flex-1 overflow-y-auto p-6">
        <TeamNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="violet" title="Total Hours" value={loading ? "—" : `${totalHours}h`} icon={Timer} />
          <StatCard accent="sky" title="Entries" value={loading ? "—" : entries.length} icon={Clock} />
          <StatCard
            accent={activeEntry ? "emerald" : "indigo"}
            title="Timer"
            value={activeEntry ? "Running" : "Stopped"}
            description={activeEntry ? "Active session" : "No active timer"}
            icon={Clock}
          />
        </div>

        <Card
          className={cn(
            "mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800",
            activeEntry && "border-emerald-300 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900"
          )}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  activeEntry ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-sky-100 dark:bg-sky-900/40"
                )}
              >
                <Clock className={cn("h-7 w-7", activeEntry ? "text-emerald-600" : "text-sky-600")} />
              </div>
              <div>
                <p className="text-lg font-semibold">{activeEntry ? "Timer Running" : "No Active Timer"}</p>
                {activeEntry && (
                  <p className="text-sm text-muted-foreground">
                    Started {formatDate(activeEntry.startTime)}
                    {activeEntry.task && ` · ${activeEntry.task.title}`}
                  </p>
                )}
              </div>
            </div>
            {activeEntry ? (
              <Button onClick={handleStop} disabled={actionLoading} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                Stop Timer
              </Button>
            ) : (
              <Button onClick={handleStart} disabled={actionLoading} className="gap-2 bg-sky-600 hover:bg-sky-700">
                <Play className="h-4 w-4" />
                Start Timer
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle>Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={entries}
              loading={loading}
              getRowKey={(e) => e.id}
              className="border-0"
              emptyMessage="No time entries yet"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
