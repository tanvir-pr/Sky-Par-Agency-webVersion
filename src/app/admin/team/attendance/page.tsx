"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, Clock, UserCheck, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { TeamNav } from "@/components/admin/team/team-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface AttendanceRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  checkedIn: boolean;
  firstLogin: string | null;
  isWorking: boolean;
  lastLoginAt: string | null;
}

const columns: Column<AttendanceRecord>[] = [
  {
    key: "name",
    header: "Employee",
    cell: (r) => (
      <div>
        <p className="font-medium">{r.name}</p>
        <p className="text-xs text-muted-foreground">{r.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    cell: (r) => (
      <span className="capitalize">{r.role.toLowerCase().replace(/_/g, " ")}</span>
    ),
  },
  {
    key: "checkedIn",
    header: "Today",
    cell: (r) => (
      <Badge
        variant="outline"
        className={
          r.checkedIn
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
            : "bg-slate-100 text-slate-600"
        }
      >
        {r.checkedIn ? "Present" : "Absent"}
      </Badge>
    ),
  },
  {
    key: "firstLogin",
    header: "First Login",
    cell: (r) => (r.firstLogin ? formatDate(r.firstLogin) : "—"),
  },
  {
    key: "isWorking",
    header: "Status",
    cell: (r) =>
      r.isWorking ? (
        <Badge className="bg-indigo-100 text-indigo-700">Working</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/attendance")
      .then((res) => {
        setAttendance(res.data.attendance);
        setDate(res.data.date);
      })
      .catch(() => setAttendance([]))
      .finally(() => setLoading(false));
  }, []);

  const present = attendance.filter((a) => a.checkedIn).length;
  const working = attendance.filter((a) => a.isWorking).length;
  const attendanceRate =
    attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  return (
    <>
      <AdminHeader title="Attendance" description="Team attendance for today" />
      <div className="flex-1 overflow-y-auto p-6">
        <TeamNav />

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard
            accent="emerald"
            title="Present Today"
            value={loading ? "—" : `${present} / ${attendance.length}`}
            icon={UserCheck}
          />
          <StatCard
            accent="indigo"
            title="Currently Working"
            value={loading ? "—" : working}
            icon={Clock}
          />
          <StatCard
            accent="sky"
            title="Attendance Rate"
            value={loading ? "—" : `${attendanceRate}%`}
            icon={Users}
          />
          <StatCard
            accent="violet"
            title="Date"
            value={loading ? "—" : date ? formatDate(date) : "—"}
            icon={Calendar}
          />
        </div>

        <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle>Team Attendance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={attendance}
              loading={loading}
              getRowKey={(r) => r.id}
              className="border-0"
              emptyMessage="No team members found"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
