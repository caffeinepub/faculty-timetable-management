import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity as ActivityIcon,
  AlertTriangle as AlertTriangleIcon,
  BarChart2 as BarChart2Icon,
  Printer as PrinterIcon,
  Users as UsersIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import { useWorkloadStore } from "../../store/useWorkloadStore";

export function WorkloadPlanner() {
  const { faculty } = useFacultyStore();
  const { entries } = useWorkloadStore();
  const { entries: timetableEntries } = useTimetableStore();
  const { bills } = useBillingStore();

  const teachers = faculty.filter(
    (f) => f.role === "teacher" && f.approvalStatus === "approved",
  );

  // Compute workload per teacher dynamically
  const workloadData = useMemo(() => {
    return teachers.map((teacher) => {
      // Weekly hours from timetable
      const teacherEntries = timetableEntries.filter(
        (e) => e.teacherId === teacher.id,
      );
      const weeklyHours = teacherEntries.reduce((sum, entry) => {
        const [sh, sm] = entry.startTime.split(":").map(Number);
        const [eh, em] = entry.endTime.split(":").map(Number);
        return sum + (eh * 60 + em - sh * 60 - sm) / 60;
      }, 0);

      // Actual hours this month from approved bills
      const now = new Date();
      const approvedBills = bills.filter((b) => {
        if (b.teacherId !== teacher.id || b.status !== "Approved") return false;
        const d = new Date(b.date);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        );
      });
      const actualHours = approvedBills.reduce((s, b) => s + b.hoursTaught, 0);

      // Check store entries for overrides
      const storeEntries = entries.filter((e) => e.teacherId === teacher.id);
      const storeWeekly =
        storeEntries.length > 0
          ? storeEntries.reduce((s, e) => s + e.weeklyHours, 0)
          : weeklyHours;
      const storeActual =
        storeEntries.length > 0
          ? storeEntries.reduce((s, e) => s + e.actualHoursThisMonth, 0)
          : actualHours;
      const maxHours = teacher.monthlyLimit
        ? Math.floor(teacher.monthlyLimit / 800)
        : 80;

      const utilization =
        maxHours > 0 ? Math.round((storeActual / maxHours) * 100) : 0;
      let statusLabel: "Overloaded" | "Normal" | "Underloaded";
      if (storeWeekly > 20 || storeActual > maxHours * 0.9)
        statusLabel = "Overloaded";
      else if (storeWeekly < 8) statusLabel = "Underloaded";
      else statusLabel = "Normal";

      return {
        id: teacher.id,
        name: teacher.name,
        department: teacher.department ?? "—",
        weeklyHours: Math.round(storeWeekly * 10) / 10,
        actualHours: storeActual,
        maxHours,
        utilization,
        status: statusLabel,
      };
    });
  }, [teachers, timetableEntries, bills, entries]);

  const overloadedCount = workloadData.filter(
    (w) => w.status === "Overloaded",
  ).length;
  const underloadedCount = workloadData.filter(
    (w) => w.status === "Underloaded",
  ).length;
  const avgWeekly = workloadData.length
    ? Math.round(
        (workloadData.reduce((s, w) => s + w.weeklyHours, 0) /
          workloadData.length) *
          10,
      ) / 10
    : 0;

  const chartData = workloadData.map((w) => ({
    name: w.name.split(" ").slice(-1)[0],
    fullName: w.name,
    weekly: w.weeklyHours,
    monthly: w.actualHours,
    max: w.maxHours,
  }));

  const statusBadge = (status: "Overloaded" | "Normal" | "Underloaded") => {
    if (status === "Overloaded")
      return <Badge variant="destructive">Overloaded</Badge>;
    if (status === "Underloaded")
      return <Badge variant="secondary">Underloaded</Badge>;
    return (
      <Badge variant="outline" className="text-green-600 border-green-400">
        Normal
      </Badge>
    );
  };

  const barColor = (status: "Overloaded" | "Normal" | "Underloaded") => {
    if (status === "Overloaded") return "#ef4444";
    if (status === "Underloaded") return "#94a3b8";
    return "#22c55e";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="workload.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workload Planner</h1>
          <p className="text-sm text-muted-foreground">कार्यभार योजनाकार</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              toast.info(
                "Feature: drag subjects between teachers coming soon / जल्द आ रहा है",
              )
            }
            data-ocid="workload.reassign_button"
          >
            <ActivityIcon className="w-4 h-4 mr-2" /> Reassign Subject
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            data-ocid="workload.print_button"
          >
            <PrinterIcon className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Teachers",
            labelH: "कुल शिक्षक",
            value: teachers.length,
            icon: <UsersIcon className="w-5 h-5" />,
            color: "text-primary",
          },
          {
            label: "Overloaded",
            labelH: "अतिभारित",
            value: overloadedCount,
            icon: <AlertTriangleIcon className="w-5 h-5" />,
            color: "text-destructive",
          },
          {
            label: "Underloaded",
            labelH: "कम भारित",
            value: underloadedCount,
            icon: <BarChart2Icon className="w-5 h-5" />,
            color: "text-amber-500",
          },
          {
            label: "Avg Hours/Week",
            labelH: "औसत घंटे/सप्ताह",
            value: `${avgWeekly}h`,
            icon: <ActivityIcon className="w-5 h-5" />,
            color: "text-blue-500",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-card">
            <CardContent className="pt-6 pb-4">
              <div className={`mb-2 ${s.color}`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground">
                {s.labelH}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar Chart */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            Weekly Hours per Teacher / प्रति शिक्षक साप्ताहिक घंटे
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64" data-ocid="workload.chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "weekly"
                      ? "Weekly Hours"
                      : name === "monthly"
                        ? "Monthly Hours"
                        : "Max Hours",
                  ]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.fullName ?? label
                  }
                />
                <Bar dataKey="weekly" name="weekly" radius={[4, 4, 0, 0]}>
                  {workloadData.map((wd) => (
                    <Cell key={wd.id} fill={barColor(wd.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Workload Table */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            कार्यभार विवरण / Workload Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="workload.table">
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Weekly Hours</TableHead>
                <TableHead>Monthly Actual</TableHead>
                <TableHead>Monthly Limit</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workloadData.map((w, i) => (
                <TableRow key={w.id} data-ocid={`workload.item.${i + 1}`}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{w.department}</TableCell>
                  <TableCell>{w.weeklyHours}h</TableCell>
                  <TableCell>{w.actualHours}h</TableCell>
                  <TableCell>{w.maxHours}h</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            w.utilization > 90
                              ? "bg-destructive"
                              : w.utilization > 60
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(w.utilization, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs w-10 text-right">
                        {w.utilization}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(w.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {workloadData.length === 0 && (
            <p
              className="text-sm text-muted-foreground text-center py-8"
              data-ocid="workload.empty_state"
            >
              No teacher workload data available
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
