import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart2, Download } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import { exportToExcel } from "../../lib/xlsxUtils";
import { calcNet, calcTds, useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import type { FacultyProfile } from "../../types/models";

interface CheckerStatsProps {
  profile: FacultyProfile;
}

const SHORT_MONTHS = [
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

export function CheckerStats({ profile: _profile }: CheckerStatsProps) {
  const { bills } = useBillingStore();
  const { getFacultyById } = useFacultyStore();
  const now = new Date();

  const processedBills = useMemo(
    () =>
      bills
        .filter((b) => b.status !== "Draft" && b.status !== "Submitted")
        .sort(
          (a, b) =>
            new Date(b.checkedAt ?? b.createdAt).getTime() -
            new Date(a.checkedAt ?? a.createdAt).getTime(),
        ),
    [bills],
  );

  const thisMonthBills = useMemo(
    () =>
      processedBills.filter((b) => {
        const d = new Date(b.checkedAt ?? b.createdAt);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }),
    [processedBills, now],
  );

  const approvedThisMonth = thisMonthBills.filter(
    (b) => b.status === "Approved",
  ).length;
  const rejectedThisMonth = thisMonthBills.filter(
    (b) => b.status === "Rejected",
  ).length;

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthBills = processedBills.filter((b) => {
        const bd = new Date(b.checkedAt ?? b.createdAt);
        return bd.getMonth() === month && bd.getFullYear() === year;
      });
      return {
        month: SHORT_MONTHS[month],
        Approved: monthBills.filter((b) => b.status === "Approved").length,
        Rejected: monthBills.filter((b) => b.status === "Rejected").length,
      };
    });
  }, [processedBills, now]);

  const exportExcel = () => {
    const data = processedBills.slice(0, 50).map((b) => {
      const teacher = getFacultyById(b.teacherId);
      const tds = calcTds(b.totalAmount);
      const net = calcNet(b.totalAmount);
      return {
        Faculty: teacher?.name ?? b.teacherId,
        Date: new Date(b.date).toLocaleDateString("en-IN"),
        "Hours Taught": b.hoursTaught,
        "Gross (₹)": b.totalAmount,
        "TDS 10% (₹)": tds,
        "Net (₹)": net,
        Status: b.status,
        "Checked At": b.checkedAt
          ? new Date(b.checkedAt).toLocaleDateString("en-IN")
          : "",
      };
    });
    exportToExcel(data, "Checker Stats", "checker_stats.xlsx")
      .then(() => toast.success("Excel exported"))
      .catch(() => toast.error("Export failed"));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="checker_stats.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">My Statistics</h2>
          <p className="text-xs text-muted-foreground">चेकर का विवरण</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={exportExcel}
          data-ocid="checker_stats.export.button"
        >
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Processed This Month",
            labelHi: "इस माह निपटाए",
            value: thisMonthBills.length,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "Approved",
            labelHi: "अनुमोदित",
            value: approvedThisMonth,
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Rejected",
            labelHi: "अस्वीकृत",
            value: rejectedThisMonth,
            color: "bg-red-100 text-red-600",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}
              >
                <BarChart2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-[10px] text-muted-foreground">
                {s.labelHi}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            6-Month Activity Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              Approved: { label: "Approved", color: "hsl(var(--chart-1))" },
              Rejected: { label: "Rejected", color: "hsl(var(--chart-2))" },
            }}
            className="h-[200px] w-full"
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="Approved"
                fill="var(--color-Approved)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="Rejected"
                fill="var(--color-Rejected)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Recent Processed Bills
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="checker_stats.table">
            <TableHeader>
              <TableRow>
                <TableHead>Faculty</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">TDS 10% (₹)</TableHead>
                <TableHead className="text-right">Net (₹)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedBills.slice(0, 10).map((bill, i) => {
                const teacher = getFacultyById(bill.teacherId);
                const tds = calcTds(bill.totalAmount);
                const net = calcNet(bill.totalAmount);
                return (
                  <TableRow
                    key={bill.id}
                    data-ocid={`checker_stats.item.${i + 1}`}
                  >
                    <TableCell className="text-sm font-medium">
                      {teacher?.name ?? bill.teacherId}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(bill.date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-700">
                      ₹{bill.totalAmount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      ₹{tds.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ₹{net.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <BillStatusBadge status={bill.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {processedBills.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="checker_stats.empty_state"
                  >
                    No processed bills yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
