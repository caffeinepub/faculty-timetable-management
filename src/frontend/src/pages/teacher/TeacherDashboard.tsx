import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CalendarOff,
  CheckCircle,
  Clock,
  FileText,
  Newspaper,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useNavigation } from "../../App";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import { useBillingStore } from "../../store/useBillingStore";
import { useLeaveStore } from "../../store/useLeaveStore";
import { useNoticeBoardStore } from "../../store/useNoticeBoardStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { usePerformanceStore } from "../../store/usePerformanceStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { FacultyProfile } from "../../types/models";

interface TeacherDashboardProps {
  profile: FacultyProfile;
}

const PRIORITY_LEFT_BORDER: Record<string, string> = {
  Urgent: "border-l-4 border-l-red-500",
  Important: "border-l-4 border-l-amber-500",
  Normal: "",
};

export function TeacherDashboard({ profile }: TeacherDashboardProps) {
  const { navigate } = useNavigation();
  const { entries, subjects, rooms, batches } = useTimetableStore();
  const { getBillsByTeacher, calculateMonthlyEarnings } = useBillingStore();
  const { getNotificationsForUser, getUnreadCount, isRead } =
    useNotificationStore();
  const { getApprovedLeavesCount } = useLeaveStore();
  const { getActiveNotices } = useNoticeBoardStore();
  const { getAverageScore, getReviewsByTeacher } = usePerformanceStore();

  const myEntries = entries.filter((e) => e.teacherId === profile.id);
  const today = new Date();
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayDay = dayNames[today.getDay()];
  const todaySchedule = myEntries.filter((e) => e.day === todayDay);
  const myBills = getBillsByTeacher(profile.id);
  const pendingBills = myBills.filter(
    (b) => b.status === "Draft" || b.status === "Submitted",
  );
  const unreadNotifs = getUnreadCount(profile.id);
  const notifications = getNotificationsForUser(profile.id);

  const monthlyEarnings = useMemo(
    () =>
      calculateMonthlyEarnings(
        profile.id,
        today.getFullYear(),
        today.getMonth() + 1,
      ),
    [profile.id, calculateMonthlyEarnings, today],
  );

  const casualRemaining = Math.max(
    0,
    12 - getApprovedLeavesCount(profile.id, "Casual", today.getFullYear()),
  );
  const sickRemaining = Math.max(
    0,
    10 - getApprovedLeavesCount(profile.id, "Sick", today.getFullYear()),
  );

  const monthlyLimit = profile.monthlyLimit ?? 45000;
  const earningsPercent = Math.min(
    Math.round((monthlyEarnings.gross / monthlyLimit) * 100),
    100,
  );
  const tdsApplied = monthlyEarnings.tds > 0;

  const activeNotices = useMemo(() => getActiveNotices(), [getActiveNotices]);
  const noticePreview = activeNotices.slice(0, 3);

  // Performance summary
  const avgScore = useMemo(
    () => getAverageScore(profile.id),
    [profile.id, getAverageScore],
  );
  const myReviews = useMemo(
    () => getReviewsByTeacher(profile.id),
    [profile.id, getReviewsByTeacher],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="teacher_dashboard.page"
    >
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[oklch(0.265_0.075_243)] to-[oklch(0.31_0.068_243)] rounded-xl p-5 text-white">
        <h2 className="text-xl font-bold">
          नमस्ते, {profile.name.split(" ")[0]}! 🙏
        </h2>
        <p className="text-white/70 text-sm mt-1">
          {today.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="flex gap-4 mt-3 flex-wrap">
          <div className="bg-white/10 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-white/60">Classes today:</span>{" "}
            <strong>{todaySchedule.length}</strong>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-white/60">This month:</span>{" "}
            <strong>₹{monthlyEarnings.gross.toLocaleString("en-IN")}</strong>
          </div>
          {avgScore > 0 && (
            <div className="bg-white/10 rounded-lg px-3 py-1.5 text-sm">
              <span className="text-white/60">Performance:</span>{" "}
              <strong>{avgScore}/10</strong>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          size="sm"
          onClick={() => navigate("/teacher/leave")}
          className="gap-2"
          data-ocid="teacher_dashboard.apply_leave.button"
        >
          <CalendarOff className="w-4 h-4" />
          Apply Leave
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/teacher/earnings")}
          className="gap-2"
          data-ocid="teacher_dashboard.view_earnings.button"
        >
          <TrendingUp className="w-4 h-4" />
          View Earnings
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/teacher/bills")}
          className="gap-2"
          data-ocid="teacher_dashboard.submit_bill.button"
        >
          <FileText className="w-4 h-4" />
          Submit Bill
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/teacher/noticeboard")}
          className="gap-2"
          data-ocid="teacher_dashboard.view_notices.button"
        >
          <Newspaper className="w-4 h-4" />
          Notice Board
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/teacher/performance")}
          className="gap-2"
          data-ocid="teacher_dashboard.performance.button"
        >
          <Star className="w-4 h-4" />
          My Performance
        </Button>
      </div>

      {/* TDS warnings */}
      {tdsApplied && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              टीडीएस लागू / TDS Applied
            </p>
            <p className="text-xs text-red-600">
              Gross: ₹{monthlyEarnings.gross.toLocaleString("en-IN")} − TDS 10%:
              ₹{monthlyEarnings.tds.toLocaleString("en-IN")} = Net: ₹
              {monthlyEarnings.net.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* Earnings progress bar */}
      {monthlyLimit && monthlyLimit > 0 && (
        <Card className="border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">
                  मासिक कमाई / Monthly Earnings
                </p>
                <p className="text-xs text-muted-foreground">
                  Limit: ₹{monthlyLimit.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold">
                  ₹{monthlyEarnings.gross.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {earningsPercent}% used
                </p>
              </div>
            </div>
            <Progress
              value={earningsPercent}
              className={`h-2.5 ${
                earningsPercent >= 90
                  ? "[&>div]:bg-red-500"
                  : earningsPercent >= 70
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-green-500"
              }`}
              data-ocid="teacher_dashboard.earnings_progress"
            />
          </CardContent>
        </Card>
      )}

      {/* Performance summary card */}
      {myReviews.length > 0 && (
        <Card className="border-border shadow-card border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    मेरा प्रदर्शन / My Performance
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on {myReviews.length} review
                    {myReviews.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-700">
                  {avgScore}
                  <span className="text-sm text-muted-foreground">/10</span>
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-primary"
                  onClick={() => navigate("/teacher/performance")}
                  data-ocid="teacher_dashboard.view_performance.button"
                >
                  View Details →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Classes",
            labelHi: "आज की कक्षाएं",
            value: todaySchedule.length,
            icon: <Calendar className="w-5 h-5" />,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Pending Bills",
            labelHi: "लंबित बिल",
            value: pendingBills.length,
            icon: <FileText className="w-5 h-5" />,
            color: "text-amber-600 bg-amber-100",
          },
          {
            label: "Unread Alerts",
            labelHi: "अपठित सूचना",
            value: unreadNotifs,
            icon: <Bell className="w-5 h-5" />,
            color: "text-purple-600 bg-purple-100",
          },
          {
            label: "This Month",
            labelHi: "इस माह",
            value: `₹${monthlyEarnings.gross.toLocaleString("en-IN")}`,
            icon: <Clock className="w-5 h-5" />,
            color: "text-teal-DEFAULT bg-teal-mint/40",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-border shadow-card">
              <CardContent className="p-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold">{stat.label}</div>
                <div className="text-[10px] text-muted-foreground">
                  {stat.labelHi}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Leave balance mini cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border shadow-card">
          <CardContent className="p-3 flex items-center gap-3">
            <CalendarOff className="w-5 h-5 text-primary" />
            <div>
              <div className="text-lg font-bold">{casualRemaining}</div>
              <div className="text-xs font-medium">Casual Leave</div>
              <div className="text-[10px] text-muted-foreground">
                आकस्मिक छुट्टी शेष
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="p-3 flex items-center gap-3">
            <CalendarOff className="w-5 h-5 text-destructive" />
            <div>
              <div className="text-lg font-bold">{sickRemaining}</div>
              <div className="text-xs font-medium">Sick Leave</div>
              <div className="text-[10px] text-muted-foreground">
                बीमारी छुट्टी शेष
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today Schedule */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              आज का कार्यक्रम / Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent
            className="pt-0 space-y-2"
            data-ocid="teacher_schedule.list"
          >
            {todaySchedule.length === 0 ? (
              <div
                className="text-center py-6 text-muted-foreground"
                data-ocid="teacher_schedule.empty_state"
              >
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">आज कोई कक्षा नहीं / No classes today</p>
              </div>
            ) : (
              todaySchedule.map((entry, i) => {
                const subject = subjects.find((s) => s.id === entry.subjectId);
                const room = rooms.find((r) => r.id === entry.roomId);
                const batch = batches.find((b) => b.id === entry.batchId);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                    data-ocid={`teacher_schedule.item.${i + 1}`}
                  >
                    <div className="w-1 h-10 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {subject?.code} — {subject?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {room?.name} &bull; {batch?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{entry.startTime}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.endTime}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                सूचनाएं / Notifications
              </CardTitle>
              {unreadNotifs > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-xs">
                  {unreadNotifs}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent
            className="pt-0 space-y-2"
            data-ocid="teacher_notifications.list"
          >
            {notifications.slice(0, 4).map((n, i) => {
              const read = isRead(n.id, profile.id);
              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border ${
                    read
                      ? "bg-secondary border-border"
                      : "bg-primary/5 border-primary/20"
                  }`}
                  data-ocid={`teacher_notifications.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {n.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {n.titleHindi}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {n.body}
                      </p>
                    </div>
                    {!read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div
                className="text-center py-6 text-muted-foreground"
                data-ocid="teacher_notifications.empty_state"
              >
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  कोई नई सूचना नहीं / No new notifications
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notice Board Preview */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-primary" />
              सूचना पट्ट / Notice Board
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => navigate("/teacher/noticeboard")}
              data-ocid="teacher_dashboard.notices_view_all.button"
            >
              View All →
            </Button>
          </div>
        </CardHeader>
        <CardContent
          className="pt-0 space-y-2"
          data-ocid="teacher_notices.list"
        >
          {noticePreview.length === 0 ? (
            <div
              className="text-center py-4 text-muted-foreground text-sm"
              data-ocid="teacher_notices.empty_state"
            >
              No active notices
            </div>
          ) : (
            noticePreview.map((notice, i) => (
              <div
                key={notice.id}
                className={`p-3 rounded-lg border bg-secondary ${
                  PRIORITY_LEFT_BORDER[notice.priority] ?? ""
                }`}
                data-ocid={`teacher_notices.item.${i + 1}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 ${
                          notice.priority === "Urgent"
                            ? "bg-red-100 text-red-700"
                            : notice.priority === "Important"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold mt-1 truncate">
                      {notice.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(notice.postedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent bills */}
      {myBills.length > 0 && (
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              हालिया बिल / Recent Bills
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2" data-ocid="teacher_bills.list">
              {myBills
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .slice(0, 4)
                .map((bill, i) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    data-ocid={`teacher_bills.item.${i + 1}`}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(bill.date).toLocaleDateString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bill.hoursTaught}h &bull; ₹
                        {bill.totalAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <BillStatusBadge status={bill.status} />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
