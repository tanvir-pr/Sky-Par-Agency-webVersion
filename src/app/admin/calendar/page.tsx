"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Calendar, MapPin, Search, Video } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ToolsNav } from "@/components/admin/tools/tools-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  meetingUrl: string | null;
  creator: { name: string };
  attendees: Array<{ user: { name: string } }>;
}

export default function AdminCalendarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("/api/admin/calendar").then((res) => setMeetings(res.data.meetings ?? [])).catch(() => setMeetings([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return meetings;
    const q = search.toLowerCase();
    return meetings.filter((m) => m.title.toLowerCase().includes(q) || m.creator.name.toLowerCase().includes(q));
  }, [meetings, search]);

  const formatTime = (date: string) =>
    new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(date));

  const withVideo = meetings.filter((m) => m.meetingUrl).length;

  return (
    <>
      <AdminHeader title="Calendar" description="Meetings and scheduled events" />
      <div className="flex-1 overflow-y-auto p-6">
        <ToolsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="violet" title="This Month" value={loading ? "—" : meetings.length} icon={Calendar} />
          <StatCard accent="sky" title="Video Meetings" value={loading ? "—" : withVideo} icon={Video} />
          <StatCard accent="indigo" title="In-Person" value={loading ? "—" : meetings.filter((m) => m.location).length} icon={MapPin} />
        </div>
        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search meetings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardContent>
        </Card>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">No meetings scheduled</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((meeting) => (
              <Card key={meeting.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/50">
                        <Calendar className="h-6 w-6 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{meeting.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(meeting.startTime)} · {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
                        </p>
                        {meeting.description && <p className="mt-2 text-sm text-muted-foreground">{meeting.description}</p>}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {meeting.location && <Badge variant="outline" className="gap-1"><MapPin className="h-3 w-3" />{meeting.location}</Badge>}
                          {meeting.meetingUrl && (
                            <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer">
                              <Badge variant="outline" className="cursor-pointer gap-1 hover:bg-violet-50"><Video className="h-3 w-3" />Join</Badge>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Host: {meeting.creator.name}</p>
                      <p className="mt-1">{meeting.attendees.map((a) => a.user.name).join(", ")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
