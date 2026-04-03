import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import { TimetableGrid } from "../../components/TimetableGrid";
import { useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useTimetableStore } from "../../store/useTimetableStore";

export function AdminDashboard() {
  const { faculty } = useFacultyStore();
  const { entries, rooms, subjects } = useTimetableStore();
  const { bills } = useBillingStore();

  const stats = useMemo(
    () => ({
      totalFaculty: faculty.filter((f) => f.role === "teacher").length,
      activeSubjects: subjects.length,
      scheduledClasses: entries.length,
      roomUtilization: Math.round(
        (new Set(entries.map((e) => e.roomId)).size / rooms.length) * 100,
      ),
      pendingApprovals: faculty.filter((f) => f.approvalStatus === "pending")
        .length,
      pendingBills: bills.filter(
        (b) => b.status === "Submitted" || b.status === "Checked",
      ).length,
    }),
    [faculty, entries, rooms, subjects, bills],
  );

  const recentBills = useMemo(
    () =>
      [...bills]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [bills],
  );

  const kpiCards = [
    {
      label: "Total Faculty",
      labelHindi: "कुल शिक्षक",
      value: stats.totalFaculty,
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-100",
      delta: `${stats.pendingApprovals} pending`,
    },
    {
      label: "Active Courses",
      labelHindi: "सक्रिय विषय",
      value: stats.activeSubjects,
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-teal-DEFAULT bg-teal-mint/40",
      delta: "Across all semesters",
    },
    {
      label: "Scheduled Classes",
      labelHindi: "निर्धारित कक्षा",
      value: stats.scheduledClasses,
      icon: <Calendar className="w-5 h-5" />,
      color: "text-purple-600 bg-purple-100",
      delta: "This week",
    },
    {
      label: "Room Utilization",
      labelHindi: "कक्ष उपयोग",
      value: `${stats.roomUtilization}%`,
      icon: <Building2 className="w-5 h-5" />,
      color: "text-orange-600 bg-orange-100",
      delta: `${rooms.length} total rooms`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="admin_dashboard.page"
    >
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-border shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}
                  >
                    {kpi.icon}
                  </div>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-3xl font-extrabold text-foreground">
                  {kpi.value}
                </div>
                <div className="text-sm font-semibold text-foreground mt-0.5">
                  {kpi.label}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {kpi.labelHindi}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {kpi.delta}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable preview */}
        <Card className="lg:col-span-2 border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Weekly Timetable / साप्ताहिक समयसारणी
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {entries.length} entries
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="border border-border rounded-lg overflow-hidden">
              <TimetableGrid entries={entries} compact />
            </div>
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Alerts */}
          <Card className="border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                अलर्ट / Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {stats.pendingApprovals > 0 && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-700">
                      {stats.pendingApprovals} Pending Approval
                      {stats.pendingApprovals > 1 ? "s" : ""}
                    </p>
                    <p className="text-[10px] text-amber-600">अनुमोदन प्रतीक्षा</p>
                  </div>
                </div>
              )}
              {stats.pendingBills > 0 && (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-700">
                      {stats.pendingBills} Bills Awaiting Action
                    </p>
                    <p className="text-[10px] text-blue-600">
                      बिल कार्रवाई प्रतीक्षा
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-700">
                    System Operational
                  </p>
                  <p className="text-[10px] text-green-600">सिस्टम सক्रिय है</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent bills */}
          <Card className="border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                हालिया बिल / Recent Bills
              </CardTitle>
            </CardHeader>
            <CardContent
              className="pt-0 space-y-2"
              data-ocid="admin_dashboard.list"
            >
              {recentBills.map((bill, i) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                  data-ocid={`admin_dashboard.item.${i + 1}`}
                >
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      ₹{bill.totalAmount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(bill.date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <BillStatusBadge status={bill.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
