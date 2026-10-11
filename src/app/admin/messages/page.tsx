"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MessageSquare, Search, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ToolsNav } from "@/components/admin/tools/tools-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate, truncate } from "@/lib/utils";

interface Thread {
  id: string;
  title: string | null;
  type: string;
  updatedAt: string;
  project: { id: string; title: string } | null;
  members: Array<{ user: { name: string; role: string } }>;
  messages: Array<{ content: string; createdAt: string; sender: { name: string } }>;
}

export default function AdminMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("/api/admin/messages").then((res) => setThreads(res.data.threads ?? [])).catch(() => setThreads([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return threads;
    const q = search.toLowerCase();
    return threads.filter((t) =>
      (t.title ?? t.project?.title ?? "").toLowerCase().includes(q) ||
      t.members.some((m) => m.user.name.toLowerCase().includes(q))
    );
  }, [threads, search]);

  const projectThreads = threads.filter((t) => t.project).length;

  return (
    <>
      <AdminHeader title="Messages" description="Team chat and project conversations" />
      <div className="flex-1 overflow-y-auto p-6">
        <ToolsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="sky" title="Conversations" value={loading ? "—" : threads.length} icon={MessageSquare} />
          <StatCard accent="indigo" title="Project Chats" value={loading ? "—" : projectThreads} icon={Users} />
          <StatCard accent="violet" title="Direct Messages" value={loading ? "—" : threads.length - projectThreads} icon={MessageSquare} />
        </div>
        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardContent>
        </Card>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">No conversations found</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((thread) => {
              const lastMessage = thread.messages[0];
              return (
                <Card key={thread.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                  <CardContent className="flex gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50">
                      <MessageSquare className="h-6 w-6 text-sky-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{thread.title ?? thread.project?.title ?? "Direct Message"}</p>
                        <Badge variant="outline">{thread.type.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{thread.members.map((m) => m.user.name).join(", ")}</p>
                      {lastMessage && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{lastMessage.sender.name}:</span> {truncate(lastMessage.content, 100)}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{lastMessage ? formatDate(lastMessage.createdAt) : formatDate(thread.updatedAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
