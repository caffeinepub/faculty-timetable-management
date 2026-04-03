import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CheckSquare, Download } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import { exportToExcel } from "../../lib/xlsxUtils";
import { calcNet, calcTds, useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import type { FacultyProfile } from "../../types/models";

interface ApprovedBillsProps {
  profile: FacultyProfile;
}

export function ApprovedBills({ profile: _profile }: ApprovedBillsProps) {
  const { bills } = useBillingStore();
  const { getFacultyById } = useFacultyStore();

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

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

  const filtered = useMemo(() => {
    return processedBills.filter((b) => {
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      if (filterMonth !== "all") {
        const m = new Date(b.date).getMonth() + 1;
        if (String(m) !== filterMonth) return false;
      }
      return true;
    });
  }, [processedBills, filterStatus, filterMonth]);

  const now = new Date();
  const thisMonthBills = processedBills.filter((b) => {
    const d = new Date(b.checkedAt ?? b.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const approvedCount = thisMonthBills.filter(
    (b) => b.status === "Approved",
  ).length;
  const reviewedCount = thisMonthBills.filter(
    (b) => b.status === "Checked",
  ).length;

  const exportExcel = () => {
    const data = filtered.map((b) => {
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
        "Checker Comment": b.checkerComment ?? "",
      };
    });
    exportToExcel(data, "Processed Bills", "approved_bills.xlsx")
      .then(() => toast.success("Excel exported"))
      .catch(() => toast.error("Export failed"));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="approved_bills.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Processed Bills</h2>
          <p className="text-xs text-muted-foreground">
            निपटाए गए बिल &bull; TDS 10% हर बिल पर
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={exportExcel}
          data-ocid="approved_bills.export.button"
        >
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Checked",
            labelHi: "कुल जांचे",
            value: thisMonthBills.length,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "Approved",
            labelHi: "अनुमोदित",
            value: approvedCount,
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Reviewed",
            labelHi: "समीक्षित",
            value: reviewedCount,
            color: "bg-amber-100 text-amber-600",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-card">
            <CardContent className="p-4">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}
              >
                <CheckSquare className="w-4 h-4" />
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

      <Card className="border-border shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                className="w-36"
                data-ocid="approved_bills.status.select"
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Checked">Checked</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger
                className="w-36"
                data-ocid="approved_bills.month.select"
              >
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12",
                ].map((m) => (
                  <SelectItem key={m} value={m}>
                    Month {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card">
        <CardContent className="p-0">
          <Table data-ocid="approved_bills.table">
            <TableHeader>
              <TableRow>
                <TableHead>Faculty</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">TDS 10% (₹)</TableHead>
                <TableHead className="text-right">Net (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bill, i) => {
                const teacher = getFacultyById(bill.teacherId);
                const tds = calcTds(bill.totalAmount);
                const net = calcNet(bill.totalAmount);
                return (
                  <TableRow
                    key={bill.id}
                    data-ocid={`approved_bills.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-sm">
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
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {bill.checkerComment ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="approved_bills.empty_state"
                  >
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No processed bills found</p>
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
