import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  Building2,
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckCircle,
  Clock,
  DollarSign,
  Newspaper,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useNavigation } from "../../App";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import { TimetableGrid } from "../../components/TimetableGrid";
import { useBillingStore } from "../../store/useBillingStore";
import { useCalendarStore } from "../../store/useCalendarStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useLeaveStore } from "../../store/useLeaveStore";
import { useNoticeBoardStore } from "../../store/useNoticeBoardStore";
import { usePerformanceStore } from "../../store/usePerformanceStore";
import { useStudentAttendanceStore } from "../../store/useStudentAttendanceStore";
import { useStudentStore } from "../../store/useStudentStore";
import { useTimetableStore } from "../../store/useTimetableStore";

const PRIORITY_BADGE: Record<string, string> = {
  Normal: "bg-muted text-muted-foreground",
  Important: "bg-amber-100 text-amber-700",
  Urgent: "bg-red-100 text-red-700",
};

export function AdminDashboard() {
  const { navigate } = useNavigation();
  const { faculty } = useFacultyStore();
  const { entries, rooms, subjects } = useTimetableStore();
  const { bills } = useBillingStore();
  const { getPendingLeaves } = useLeaveStore();
  const { getUpcomingEvents } = useCalendarStore();
  const { getActiveNotices } = useNoticeBoardStore();
  const { students } = useStudentStore();
  const { submissions } = useStudentAttendanceStore();
  const { getActiveCycles } = usePerformanceStore();

  const pendingLeaves = getPendingLeaves();
  const upcomingEvents = getUpcomingEvents(2);
  const activeNotices = useMemo(() => getActiveNotices(), [getActiveNotices]);
  const noticePreview = activeNotices.slice(0, 2);

  // This month payout
  const now = new Date();
  const thisMonthPayout = useMemo(() => {
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    return bills
      .filter((b) => {
        if (b.status !== "Approved") return false;
        const d = new Date(b.date);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      })
      .reduce((s, b) => s + b.totalAmount, 0);
  }, [bills, now]);

  // Attendance rate this month
  const attendanceRate = useMemo(() => {
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thisMonthSubs = submissions.filter((s) => s.month === thisMonth);
    if (thisMonthSubs.length === 0) return 0;
    const submitted = thisMonthSubs.filter(
      (s) => s.status === "Submitted" || s.status === "Approved",
    ).length;
    return Math.round((submitted / thisMonthSubs.length) * 100);
  }, [submissions, now]);

  const activeCycles = getActiveCycles();

  const stats = useMemo(
    () => ({
      totalFaculty: faculty.filter((f) => f.role === "teacher").length,
      activeSubjects: subjects.length,
      scheduledClasses: entries.length,
      roomUtilization: Math.round(
        (new Set(entries.map((e) => e.roomId)).size /
          Math.max(rooms.length, 1)) *
          100,
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
    {
      label: "This Month Payout",
      labelHindi: "इस माह भुगतान",
      value: `₹${thisMonthPayout.toLocaleString("en-IN")}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-600 bg-green-100",
      delta: "Approved bills",
    },
    {
      label: "Active Students",
      labelHindi: "सक्रिय छात्र",
      value: students.length,
      icon: <Users className="w-5 h-5" />,
      color: "text-cyan-600 bg-cyan-50",
      delta: "Enrolled",
    },
    {
      label: "Attendance Rate",
      labelHindi: "उपस्थिति दर",
      value: `${attendanceRate}%`,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-lime-600 bg-lime-50",
      delta: "This month",
    },
    {
      label: "Pending Reviews",
      labelHindi: "लंबित समीक्षा",
      value: activeCycles.length,
      icon: <Star className="w-5 h-5" />,
      color: "text-amber-600 bg-amber-50",
      delta: "Active cycles",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="admin_dashboard.page"
    >
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          onClick={() => navigate("/admin/faculty/register")}
          className="gap-2"
          data-ocid="admin_dashboard.register_faculty.button"
        >
          <UserPlus className="w-4 h-4" />
          Register Faculty
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/admin/billing")}
          className="gap-2"
          data-ocid="admin_dashboard.new_bill.button"
        >
          <TrendingUp className="w-4 h-4" />
          New Bill Entry
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/admin/reports")}
          className="gap-2"
          data-ocid="admin_dashboard.view_reports.button"
        >
          <BarChart2 className="w-4 h-4" />
          View Reports
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/admin/calendar")}
          className="gap-2"
          data-ocid="admin_dashboard.view_calendar.button"
        >
          <CalendarRange className="w-4 h-4" />
          View Calendar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/admin/fees")}
          className="gap-2"
          data-ocid="admin_dashboard.fee_management.button"
        >
          <DollarSign className="w-4 h-4" />
          Fee Management
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/admin/performance")}
          className="gap-2"
          data-ocid="admin_dashboard.performance_review.button"
        >
          <Star className="w-4 h-4" />
          Performance Review
        </Button>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timetable */}
        <Card className="lg:col-span-2 border-border shadow-card">
          <CardHeader className="pb-2">
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
              {pendingLeaves.length > 0 && (
                <button
                  type="button"
                  className="flex items-center gap-2 p-2.5 bg-teal-50 rounded-lg border border-teal-200 cursor-pointer hover:bg-teal-100 transition-colors w-full text-left"
                  onClick={() => navigate("/admin/leaves")}
                  data-ocid="admin_dashboard.leaves_alert.button"
                >
                  <CalendarDays className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-teal-700">
                      {pendingLeaves.length} Leave{" "}
                      {pendingLeaves.length > 1 ? "Requests" : "Request"}{" "}
                      Pending
                    </p>
                    <p className="text-[10px] text-teal-600">छुट्टी अनुरोध लंबित</p>
                  </div>
                </button>
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
              {/* Upcoming events */}
              {upcomingEvents.map((evt) => (
                <button
                  key={evt.id}
                  type="button"
                  className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors w-full text-left"
                  onClick={() => navigate("/admin/calendar")}
                >
                  <CalendarRange className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-purple-700">
                      {evt.title}
                    </p>
                    <p className="text-[10px] text-purple-600">
                      {new Date(evt.date).toLocaleDateString("en-IN")} &bull;{" "}
                      {evt.type}
                    </p>
                  </div>
                </button>
              ))}
              <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-700">
                    System Operational
                  </p>
                  <p className="text-[10px] text-green-600">सिस्टम सक्रिय है</p>
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

          {/* Notice Board Preview */}
          <Card className="border-border shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-primary" />
                  सूचना पट्ट / Notices
                </CardTitle>
                <button
                  type="button"
                  onClick={() => navigate("/admin/noticeboard")}
                  className="text-xs text-primary hover:underline"
                  data-ocid="admin_dashboard.notices_manage.button"
                >
                  Manage →
                </button>
              </div>
            </CardHeader>
            <CardContent
              className="pt-0 space-y-2"
              data-ocid="admin_notices.list"
            >
              {noticePreview.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No active notices
                </p>
              ) : (
                noticePreview.map((notice, i) => (
                  <div
                    key={notice.id}
                    className="p-2.5 bg-secondary rounded-lg"
                    data-ocid={`admin_notices.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 ${PRIORITY_BADGE[notice.priority] ?? ""}`}
                      >
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium mt-1 truncate">
                      {notice.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(notice.postedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
