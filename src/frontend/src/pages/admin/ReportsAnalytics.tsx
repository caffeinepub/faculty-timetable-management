import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Download, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useAttendanceStore } from "../../store/useAttendanceStore";
import { TDS_RATE, useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useTimetableStore } from "../../store/useTimetableStore";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function ReportsAnalytics() {
  const { faculty } = useFacultyStore();
  const { bills, payments } = useBillingStore();
  const { subjects } = useTimetableStore();
  const { records, getSubjectStats } = useAttendanceStore();
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1),
  );

  const teachers = faculty.filter(
    (f) => f.role === "teacher" && f.approvalStatus === "approved",
  );

  const approvedBills = useMemo(
    () => bills.filter((b) => b.status === "Approved"),
    [bills],
  );

  const totalHours = useMemo(
    () => approvedBills.reduce((s, b) => s + b.hoursTaught, 0),
    [approvedBills],
  );
  const totalPayout = useMemo(
    () => approvedBills.reduce((s, b) => s + b.totalAmount, 0),
    [approvedBills],
  );
  const totalTds = useMemo(() => {
    let tds = 0;
    for (const t of teachers) {
      const teacherBills = approvedBills.filter((b) => b.teacherId === t.id);
      const gross = teacherBills.reduce((s, b) => s + b.totalAmount, 0);
      tds += Math.round(gross * TDS_RATE);
    }
    return tds;
  }, [approvedBills, teachers]);

  // Monthly chart data - last 6 months
  const monthlyChartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthBills = approvedBills.filter((b) => {
        const bd = new Date(b.date);
        return bd.getMonth() + 1 === m && bd.getFullYear() === y;
      });
      const gross = monthBills.reduce((s, b) => s + b.totalAmount, 0);
      return {
        month: `${MONTH_NAMES[m - 1]}'${String(y).slice(2)}`,
        earnings: gross,
        hours: monthBills.reduce((s, b) => s + b.hoursTaught, 0),
      };
    });
  }, [approvedBills]);

  // Faculty report for selected month
  const facultyReport = useMemo(() => {
    const y = Number(selectedYear);
    const m = Number(selectedMonth);
    return teachers.map((t) => {
      const tBills = approvedBills.filter((b) => {
        const bd = new Date(b.date);
        return (
          b.teacherId === t.id &&
          bd.getFullYear() === y &&
          bd.getMonth() + 1 === m
        );
      });
      const gross = tBills.reduce((s, b) => s + b.totalAmount, 0);
      const hours = tBills.reduce((s, b) => s + b.hoursTaught, 0);
      const tds = Math.round(gross * TDS_RATE);
      return {
        teacher: t,
        hours,
        gross,
        tds,
        net: gross - tds,
        billCount: tBills.length,
      };
    });
  }, [teachers, approvedBills, selectedYear, selectedMonth]);

  // TDS Report
  const tdsReport = useMemo(
    () => facultyReport.filter((r) => r.tds > 0),
    [facultyReport],
  );

  // Attendance stats by subject
  const subjectStats = useMemo(() => getSubjectStats(), [getSubjectStats]);

  // Salary summary: check if teacher has an RTGS payment for the selected month
  const salarySummary = useMemo(() => {
    const y = Number(selectedYear);
    const m = Number(selectedMonth);
    return facultyReport.map((r) => {
      // Check if there's a processed RTGS payment whose billIds overlap with teacher's bills
      const teacherApprovedBillIds = approvedBills
        .filter((b) => {
          const bd = new Date(b.date);
          return (
            b.teacherId === r.teacher.id &&
            bd.getFullYear() === y &&
            bd.getMonth() + 1 === m
          );
        })
        .map((b) => b.id);

      const isPaid =
        teacherApprovedBillIds.length > 0 &&
        payments.some(
          (p) =>
            p.status === "Processed" &&
            p.teacherId === r.teacher.id &&
            p.billIds.some((bid) => teacherApprovedBillIds.includes(bid)),
        );

      return { ...r, isPaid };
    });
  }, [facultyReport, payments, approvedBills, selectedYear, selectedMonth]);

  const salaryTotals = useMemo(() => {
    const gross = salarySummary.reduce((s, r) => s + r.gross, 0);
    const tds = salarySummary.reduce((s, r) => s + r.tds, 0);
    const net = salarySummary.reduce((s, r) => s + r.net, 0);
    return { gross, tds, net };
  }, [salarySummary]);

  const chartConfig = {
    earnings: { label: "Earnings (₹)", color: "hsl(var(--chart-1))" },
    hours: { label: "Hours", color: "hsl(var(--chart-2))" },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="reports.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Reports &amp; Analytics
          </h2>
          <p className="text-xs text-muted-foreground">रिपोर्ट और विश्लेषण</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Exported to CSV")}
          data-ocid="reports.export_button"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="overview" data-ocid="reports.tab">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="faculty">Faculty Report</TabsTrigger>
          <TabsTrigger value="tds">TDS Report</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="salary">वेतन / Salary</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Hours",
                labelHi: "कुल घंटे",
                value: `${totalHours}h`,
                color: "bg-blue-100 text-blue-600",
              },
              {
                label: "Total Payout",
                labelHi: "कुल भुगतान",
                value: `₹${totalPayout.toLocaleString("en-IN")}`,
                color: "bg-green-100 text-green-600",
              },
              {
                label: "TDS Collected",
                labelHi: "कुल टीडीएस",
                value: `₹${Math.round(totalTds).toLocaleString("en-IN")}`,
                color: "bg-orange-100 text-orange-600",
              },
              {
                label: "Avg Rate/hr",
                labelHi: "औसत दर",
                value: `₹${totalHours > 0 ? Math.round(totalPayout / totalHours) : 0}`,
                color: "bg-purple-100 text-purple-600",
              },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-border shadow-card">
                <CardContent className="p-4">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}
                  >
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-extrabold">{kpi.value}</div>
                  <div className="text-sm font-semibold">{kpi.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {kpi.labelHi}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Monthly Earnings — Last 6 Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="earnings"
                    fill="var(--color-earnings)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FACULTY REPORT */}
        <TabsContent value="faculty" className="space-y-4 mt-4">
          <div className="flex gap-3 items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-36" data-ocid="reports.month.select">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-28" data-ocid="reports.year.select">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table data-ocid="reports.faculty.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Gross (₹)</TableHead>
                    <TableHead className="text-right">TDS (₹)</TableHead>
                    <TableHead className="text-right">Net (₹)</TableHead>
                    <TableHead className="text-right">Bills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyReport.map((r, i) => (
                    <TableRow
                      key={r.teacher.id}
                      data-ocid={`reports.faculty.item.${i + 1}`}
                    >
                      <TableCell>
                        <div className="font-medium text-sm">
                          {r.teacher.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {r.teacher.department}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{r.hours}h</TableCell>
                      <TableCell className="text-right">
                        ₹{r.gross.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.tds > 0 ? (
                          <span className="text-orange-600">
                            ₹{r.tds.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{r.net.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{r.billCount}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {facultyReport.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="reports.faculty.empty_state"
                      >
                        No data for selected month
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TDS REPORT */}
        <TabsContent value="tds" className="space-y-4 mt-4">
          <Card className="border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                TDS Deductions — Teachers above ₹ TDS 10% applied on every bill
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table data-ocid="reports.tds.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-right">Gross (₹)</TableHead>
                    <TableHead className="text-right">
                      TDS @ {TDS_RATE * 100}%
                    </TableHead>
                    <TableHead className="text-right">Net (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tdsReport.map((r, i) => (
                    <TableRow
                      key={r.teacher.id}
                      data-ocid={`reports.tds.item.${i + 1}`}
                    >
                      <TableCell>
                        <div className="font-medium text-sm">
                          {r.teacher.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {r.teacher.designation}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{r.gross.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-orange-600 font-semibold">
                        ₹{r.tds.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{r.net.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {tdsReport.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="reports.tds.empty_state"
                      >
                        No teachers above TDS threshold this month
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ATTENDANCE */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <Card className="border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Attendance by Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table data-ocid="reports.attendance.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Total Classes</TableHead>
                    <TableHead className="text-right">
                      Avg Attendance %
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((sub, i) => {
                    const stats = subjectStats[sub.id];
                    const pct = stats
                      ? Math.round(
                          (stats.totalAttended / stats.totalStudents) * 100,
                        )
                      : 0;
                    return (
                      <TableRow
                        key={sub.id}
                        data-ocid={`reports.attendance.item.${i + 1}`}
                      >
                        <TableCell>
                          <div className="font-medium text-sm">{sub.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {sub.code}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {stats?.count ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              pct >= 75
                                ? "text-green-600"
                                : pct >= 50
                                  ? "text-amber-600"
                                  : "text-red-600"
                            }`}
                          >
                            {pct}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {subjects.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="reports.attendance.empty_state"
                      >
                        No subjects found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="text-xs text-muted-foreground">
            Total records tracked: {records.length}
          </div>
        </TabsContent>

        {/* SALARY SUMMARY */}
        <TabsContent value="salary" className="space-y-4 mt-4">
          <div className="flex gap-3 items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger
                className="w-36"
                data-ocid="reports.salary_month.select"
              >
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((m, i) => (
                  <SelectItem key={m} value={String(i + 1)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger
                className="w-28"
                data-ocid="reports.salary_year.select"
              >
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table data-ocid="reports.salary.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty / शिक्षक</TableHead>
                    <TableHead className="text-right">Gross (₹)</TableHead>
                    <TableHead className="text-right">TDS (₹)</TableHead>
                    <TableHead className="text-right">
                      Net Payable (₹)
                    </TableHead>
                    <TableHead className="text-right">Status / स्थिति</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salarySummary.map((r, i) => (
                    <TableRow
                      key={r.teacher.id}
                      data-ocid={`reports.salary.item.${i + 1}`}
                    >
                      <TableCell>
                        <div className="font-medium text-sm">
                          {r.teacher.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {r.teacher.department}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{r.gross.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.tds > 0 ? (
                          <span className="text-orange-600">
                            ₹{r.tds.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{r.net.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.gross === 0 ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            No Bills
                          </Badge>
                        ) : r.isPaid ? (
                          <Badge className="bg-green-100 text-green-700 text-[10px]">
                            भुगतान / Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 text-[10px]">
                            लंबित / Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {salarySummary.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="reports.salary.empty_state"
                      >
                        No data for selected month
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {salarySummary.length > 0 && (
                  <TableFooter>
                    <TableRow className="bg-muted font-bold">
                      <TableCell className="font-bold">कुल / Total</TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{salaryTotals.gross.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-bold text-orange-600">
                        {salaryTotals.tds > 0
                          ? `₹${salaryTotals.tds.toLocaleString("en-IN")}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{salaryTotals.net.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
