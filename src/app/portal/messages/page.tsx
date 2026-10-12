"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, truncate } from "@/lib/utils";

interface Thread {
  id: string;
  title: string | null;
  type: string;
  updatedAt: string;
  project: { id: string; title: string } | null;
  members: Array<{ user: { name: string; role: string } }>;
  messages: Array<{
    content: string;
    createdAt: string;
    sender: { name: string };
  }>;
}

export default function PortalMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/portal/messages")
      .then((res) => setThreads(res.data.threads))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PortalHeader title="Messages" description="Communicate with your project team" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : threads.length ? (
              <ul className="divide-y">
                {threads.map((thread) => {
                  const lastMessage = thread.messages[0];
                  return (
                    <li key={thread.id} className="flex gap-4 py-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100">
                        <MessageSquare className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {thread.title ?? thread.project?.title ?? "Direct Message"}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {thread.type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        {lastMessage && (
                          <>
                            <p className="mt-1 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {lastMessage.sender.name}:
                              </span>{" "}
                              {truncate(lastMessage.content, 120)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(lastMessage.createdAt)}
                            </p>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">No conversations yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
