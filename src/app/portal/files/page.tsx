"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Download, FileText } from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ClientFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number | null;
  createdAt: string;
}

interface ProjectFile extends ClientFile {
  project: { id: string; title: string };
}

export default function PortalFilesPage() {
  const [clientFiles, setClientFiles] = useState<ClientFile[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/portal/files")
      .then((res) => {
        setClientFiles(res.data.clientFiles);
        setProjectFiles(res.data.projectFiles);
      })
      .catch(() => {
        setClientFiles([]);
        setProjectFiles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <PortalHeader title="Files" description="Your shared documents and deliverables" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Files</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : clientFiles.length ? (
                <ul className="space-y-3">
                  {clientFiles.map((f) => (
                    <li key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-teal-600" />
                        <div>
                          <p className="font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(f.createdAt)} · {formatSize(f.size)}
                          </p>
                        </div>
                      </div>
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 text-muted-foreground hover:text-teal-600" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No account files</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : projectFiles.length ? (
                <ul className="space-y-3">
                  {projectFiles.map((f) => (
                    <li key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-teal-600" />
                        <div>
                          <p className="font-medium">{f.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.project.title} · {formatDate(f.createdAt)}
                          </p>
                        </div>
                      </div>
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 text-muted-foreground hover:text-teal-600" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No project files</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
