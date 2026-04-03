import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  DollarSign,
  Download,
  FileText,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import {
  TDS_RATE,
  TDS_THRESHOLD,
  useBillingStore,
} from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import type { DailyClassBill } from "../../types/models";

export function BillingOversight() {
  const { bills, updateBillStatus } = useBillingStore();
  const { getFacultyById } = useFacultyStore();
  const [selectedBill, setSelectedBill] = useState<DailyClassBill | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [reportYear, setReportYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [reportMonth, setReportMonth] = useState(
    (new Date().getMonth() + 1).toString(),
  );
  const [activeTab, setActiveTab] = useState<"pending" | "report">("pending");

  const checkedBills = bills.filter((b) => b.status === "Checked");

  const monthlyReport = useMemo(() => {
    const year = Number(reportYear);
    const month = Number(reportMonth);
    const approvedBills = bills.filter((b) => {
      if (b.status !== "Approved") return false;
      const d = new Date(b.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const byTeacher: Record<
      string,
      { gross: number; hours: number; bills: number }
    > = {};
    for (const b of approvedBills) {
      if (!byTeacher[b.teacherId])
        byTeacher[b.teacherId] = { gross: 0, hours: 0, bills: 0 };
      byTeacher[b.teacherId].gross += b.totalAmount;
      byTeacher[b.teacherId].hours += b.hoursTaught;
      byTeacher[b.teacherId].bills += 1;
    }

    return Object.entries(byTeacher).map(([teacherId, data]) => {
      const teacher = getFacultyById(teacherId);
      const tds = data.gross > TDS_THRESHOLD ? data.gross * TDS_RATE : 0;
      return {
        teacherId,
        teacherName: teacher?.name ?? "Unknown",
        ...data,
        tds,
        net: data.gross - tds,
      };
    });
  }, [bills, reportYear, reportMonth, getFacultyById]);

  const totalGross = monthlyReport.reduce((s, r) => s + r.gross, 0);
  const totalTds = monthlyReport.reduce((s, r) => s + r.tds, 0);
  const totalNet = monthlyReport.reduce((s, r) => s + r.net, 0);

  const handleApprove = () => {
    if (!selectedBill) return;
    updateBillStatus(selectedBill.id, "Approved", {
      adminComment,
      approvedBy: "demo-admin",
    });
    setSelectedBill(null);
    setAdminComment("");
    toast.success("बिल स्वीकृत / Bill approved");
  };

  const handleReject = () => {
    if (!selectedBill) return;
    updateBillStatus(selectedBill.id, "Rejected", { adminComment });
    setSelectedBill(null);
    setAdminComment("");
    toast.error("बिल अस्वीकृत / Bill rejected");
  };

  const months = [
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="billing_oversight.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">
            बिलिंग निगरानी / Billing Oversight
          </h2>
          <p className="text-xs text-muted-foreground">
            {checkedBills.length} bills awaiting approval
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeTab === "pending" ? "default" : "outline"}
            onClick={() => setActiveTab("pending")}
            data-ocid="billing.pending.tab"
          >
            <FileText className="w-4 h-4 mr-1" />
            लंबित / Pending
          </Button>
          <Button
            size="sm"
            variant={activeTab === "report" ? "default" : "outline"}
            onClick={() => setActiveTab("report")}
            data-ocid="billing.report.tab"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            रिपोर्ट / Report
          </Button>
        </div>
      </div>

      {activeTab === "pending" && (
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              अनुमोदन के लिए लंबित बिल / Bills Awaiting Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table data-ocid="billing.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkedBills.map((bill, i) => {
                  const teacher = getFacultyById(bill.teacherId);
                  return (
                    <TableRow key={bill.id} data-ocid={`billing.row.${i + 1}`}>
                      <TableCell className="text-sm font-medium">
                        {teacher?.name ?? "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(bill.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {bill.hoursTaught}h
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        ₹{bill.totalAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <BillStatusBadge status={bill.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelectedBill(bill);
                            setAdminComment("");
                          }}
                          data-ocid={`billing.edit_button.${i + 1}`}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {checkedBills.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground text-sm py-8"
                      data-ocid="billing.empty_state"
                    >
                      No bills awaiting approval
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "report" && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="border-border shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">
                    वर्ष / Year:
                  </Label>
                  <Select value={reportYear} onValueChange={setReportYear}>
                    <SelectTrigger
                      className="w-24 h-8 text-xs"
                      data-ocid="billing.year.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">
                    माह / Month:
                  </Label>
                  <Select value={reportMonth} onValueChange={setReportMonth}>
                    <SelectTrigger
                      className="w-32 h-8 text-xs"
                      data-ocid="billing.month.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m, i) => (
                        <SelectItem key={m} value={(i + 1).toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs ml-auto"
                  data-ocid="billing.download.button"
                >
                  <Download className="w-3 h-3 mr-1" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Gross Payable",
                labelHi: "कुल देय",
                value: `₹${totalGross.toLocaleString("en-IN")}`,
                icon: <DollarSign className="w-4 h-4" />,
                color: "text-green-600 bg-green-100",
              },
              {
                label: "TDS Deducted",
                labelHi: "टीडीएस",
                value: `₹${totalTds.toLocaleString("en-IN")}`,
                icon: <FileText className="w-4 h-4" />,
                color: "text-red-600 bg-red-100",
              },
              {
                label: "Net Payable",
                labelHi: "नेट देय",
                value: `₹${totalNet.toLocaleString("en-IN")}`,
                icon: <TrendingUp className="w-4 h-4" />,
                color: "text-blue-600 bg-blue-100",
              },
            ].map((kpi) => (
              <Card key={kpi.label} className="border-border shadow-xs">
                <CardContent className="p-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${kpi.color}`}
                  >
                    {kpi.icon}
                  </div>
                  <div className="text-xl font-bold">{kpi.value}</div>
                  <div className="text-xs font-medium text-foreground">
                    {kpi.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {kpi.labelHi}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Report table */}
          <Card className="border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                शिक्षकवार रिपोर्ट / Faculty-wise Report
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Bills</TableHead>
                    <TableHead>Gross (₹)</TableHead>
                    <TableHead>TDS (₹)</TableHead>
                    <TableHead>Net (₹)</TableHead>
                    <TableHead>TDS?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyReport.map((row, i) => (
                    <TableRow
                      key={row.teacherId}
                      data-ocid={`billing_report.row.${i + 1}`}
                    >
                      <TableCell className="text-sm font-medium">
                        {row.teacherName}
                      </TableCell>
                      <TableCell className="text-sm">{row.hours}h</TableCell>
                      <TableCell className="text-sm">{row.bills}</TableCell>
                      <TableCell className="text-sm">
                        {row.gross.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-destructive">
                        {row.tds.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {row.net.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {row.tds > 0 ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">
                            10%
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Nil
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {monthlyReport.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground text-sm py-8"
                        data-ocid="billing_report.empty_state"
                      >
                        No approved bills for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent data-ocid="billing_review.dialog">
          <DialogHeader>
            <DialogTitle>बिल समीक्षा / Bill Review</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-3">
              <div className="bg-secondary rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Teacher:</span>{" "}
                  {getFacultyById(selectedBill.teacherId)?.name}
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {new Date(selectedBill.date).toLocaleDateString("en-IN")}
                </div>
                <div>
                  <span className="text-muted-foreground">Hours:</span>{" "}
                  {selectedBill.hoursTaught}h
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>{" "}
                  <strong>
                    ₹{selectedBill.totalAmount.toLocaleString("en-IN")}
                  </strong>
                </div>
                {selectedBill.checkerComment && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Checker Note:</span>{" "}
                    {selectedBill.checkerComment}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs">अडमिन टिप्पणी / Admin Comment</Label>
                <Textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Optional comment..."
                  className="mt-1 text-sm h-20"
                  data-ocid="billing_review.textarea"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedBill(null)}
              data-ocid="billing_review.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              data-ocid="billing_review.delete_button"
            >
              <XCircle className="w-4 h-4 mr-1" /> Reject
            </Button>
            <Button
              onClick={handleApprove}
              data-ocid="billing_review.confirm_button"
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
