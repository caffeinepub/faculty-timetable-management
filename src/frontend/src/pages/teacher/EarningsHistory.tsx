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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TDS_RATE, useBillingStore } from "../../store/useBillingStore";
import type { FacultyProfile } from "../../types/models";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
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

interface EarningsHistoryProps {
  profile: FacultyProfile;
}

export function EarningsHistory({ profile }: EarningsHistoryProps) {
  const { bills } = useBillingStore();
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );

  const approvedBills = useMemo(
    () =>
      bills.filter(
        (b) => b.teacherId === profile.id && b.status === "Approved",
      ),
    [bills, profile.id],
  );

  const monthlyData = useMemo(() => {
    const year = Number(selectedYear);
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthBills = approvedBills.filter((b) => {
        const d = new Date(b.date);
        return d.getFullYear() === year && d.getMonth() + 1 === m;
      });
      const gross = monthBills.reduce((s, b) => s + b.totalAmount, 0);
      const hours = monthBills.reduce((s, b) => s + b.hoursTaught, 0);
      const tds = Math.round(gross * TDS_RATE);
      return {
        month: MONTH_NAMES[i],
        shortMonth: SHORT_MONTHS[i],
        gross,
        hours,
        tds,
        net: gross - tds,
      };
    });
  }, [approvedBills, selectedYear]);

  const totalAnnual = useMemo(() => {
    const gross = monthlyData.reduce((s, m) => s + m.gross, 0);
    const tds = monthlyData.reduce((s, m) => s + m.tds, 0);
    return {
      gross,
      tds,
      net: gross - tds,
      hours: monthlyData.reduce((s, m) => s + m.hours, 0),
    };
  }, [monthlyData]);

  const chartData = monthlyData
    .slice(-6)
    .map((m) => ({ month: m.shortMonth, gross: m.gross }));
  const chartConfig = {
    gross: { label: "Gross Earnings (₹)", color: "hsl(var(--chart-1))" },
  };
  const tdsMonths = monthlyData.filter((m) => m.tds > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="earnings.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Earnings History</h2>
          <p className="text-xs text-muted-foreground">कमाई इतिहास</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-28" data-ocid="earnings.year.select">
            <SelectValue />
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
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Last 6 Months Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-52 w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="gross"
                fill="var(--color-gross)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Monthly Breakdown — {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="earnings.monthly.table">
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">TDS (₹)</TableHead>
                <TableHead className="text-right">Net (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((row, i) => (
                <TableRow
                  key={row.month}
                  className={row.gross === 0 ? "opacity-40" : ""}
                  data-ocid={`earnings.monthly.item.${i + 1}`}
                >
                  <TableCell className="font-medium text-sm">
                    {row.month}
                  </TableCell>
                  <TableCell className="text-right">{row.hours}h</TableCell>
                  <TableCell className="text-right">
                    {row.gross > 0
                      ? `₹${row.gross.toLocaleString("en-IN")}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.tds > 0 ? (
                      <span className="text-orange-600">
                        ₹{row.tds.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {row.net > 0 ? `₹${row.net.toLocaleString("en-IN")}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {tdsMonths.length > 0 && (
        <Card className="border-orange-200 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-orange-700">
              TDS History / टीडीएस विवरण
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {tdsMonths.map((m, i) => (
              <div
                key={m.month}
                className="flex items-center justify-between p-2.5 bg-orange-50 rounded-lg"
                data-ocid={`earnings.tds.item.${i + 1}`}
              >
                <span className="text-sm font-medium">{m.month}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Gross: ₹{m.gross.toLocaleString("en-IN")}
                  </span>
                  <span className="text-orange-600 font-semibold">
                    TDS: ₹{m.tds.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-border shadow-card bg-gradient-to-r from-[oklch(0.265_0.075_243)] to-[oklch(0.31_0.068_243)] text-white">
        <CardContent className="p-5">
          <h3 className="font-bold text-base mb-3">
            Annual Summary — {selectedYear}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Total Hours",
                labelHi: "कुल घंटे",
                value: `${totalAnnual.hours}h`,
              },
              {
                label: "Gross Earnings",
                labelHi: "कुल कमाई",
                value: `₹${totalAnnual.gross.toLocaleString("en-IN")}`,
              },
              {
                label: "TDS Deducted",
                labelHi: "टीडीएस कटौती",
                value: `₹${totalAnnual.tds.toLocaleString("en-IN")}`,
              },
              {
                label: "Net Earnings",
                labelHi: "शुद्ध कमाई",
                value: `₹${totalAnnual.net.toLocaleString("en-IN")}`,
              },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-lg p-3">
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-white/80 text-xs">{s.label}</div>
                <div className="text-white/50 text-[10px]">{s.labelHi}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
