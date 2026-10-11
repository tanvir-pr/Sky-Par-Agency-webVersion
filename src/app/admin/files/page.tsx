"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Download, FileText, FolderKanban, Search, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ToolsNav } from "@/components/admin/tools/tools-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";

interface ClientFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number | null;
  createdAt: string;
  client: { id: string; name: string };
}

interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
  project: { id: string; title: string; client: { name: string } };
}

export default function AdminFilesPage() {
  const [clientFiles, setClientFiles] = useState<ClientFile[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "client" | "project">("all");

  useEffect(() => {
    axios
      .get("/api/admin/files")
      .then((res) => {
        setClientFiles(res.data.clientFiles ?? []);
        setProjectFiles(res.data.projectFiles ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredClient = useMemo(() => {
    if (!search.trim()) return clientFiles;
    const q = search.toLowerCase();
    return clientFiles.filter((f) => f.name.toLowerCase().includes(q) || f.client.name.toLowerCase().includes(q));
  }, [clientFiles, search]);

  const filteredProject = useMemo(() => {
    if (!search.trim()) return projectFiles;
    const q = search.toLowerCase();
    return projectFiles.filter((f) => f.name.toLowerCase().includes(q) || f.project.title.toLowerCase().includes(q));
  }, [projectFiles, search]);

  return (
    <>
      <AdminHeader title="Files" description="Manage client and project files" />
      <div className="flex-1 overflow-y-auto p-6">
        <ToolsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="amber" title="Client Files" value={loading ? "—" : clientFiles.length} icon={Users} />
          <StatCard accent="violet" title="Project Files" value={loading ? "—" : projectFiles.length} icon={FolderKanban} />
          <StatCard accent="indigo" title="Total Files" value={loading ? "—" : clientFiles.length + projectFiles.length} icon={FileText} />
        </div>
        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex rounded-lg border p-1">
              {(["all", "client", "project"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors", tab === t ? "bg-orange-600 text-white" : "text-muted-foreground hover:bg-slate-100")}>
                  {t === "all" ? "All" : `${t} files`}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">Loading files...</div>
        ) : (
          <div className="space-y-3">
            {(tab === "all" || tab === "client") && filteredClient.map((f) => (
              <Card key={f.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/50">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.client.name} · {formatDate(f.createdAt)}</p>
                  </div>
                  <Badge variant="outline">Client</Badge>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="rounded-lg border p-2 hover:bg-orange-50">
                    <Download className="h-4 w-4 text-orange-600" />
                  </a>
                </CardContent>
              </Card>
            ))}
            {(tab === "all" || tab === "project") && filteredProject.map((f) => (
              <Card key={f.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/50">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.project.title} · {f.project.client.name}</p>
                  </div>
                  <Badge variant="outline">Project</Badge>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="rounded-lg border p-2 hover:bg-violet-50">
                    <Download className="h-4 w-4 text-violet-600" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
