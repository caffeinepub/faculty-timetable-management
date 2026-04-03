import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
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
  Edit2,
  FileText,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import { exportToExcel } from "../../lib/xlsxUtils";
import {
  TDS_RATE,
  calcNet,
  calcTds,
  useBillingStore,
} from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import type { DailyClassBill } from "../../types/models";

export function BillingOversight() {
  const { bills, updateBillStatus, updateBill, deleteBill } = useBillingStore();
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

  const [editBill, setEditBill] = useState<DailyClassBill | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    hoursTaught: "",
    ratePerHour: "",
    adminComment: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      const tds = Math.round(data.gross * TDS_RATE);
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

  const handleRejectBill = () => {
    if (!selectedBill) return;
    updateBillStatus(selectedBill.id, "Rejected", { adminComment });
    setSelectedBill(null);
    setAdminComment("");
    toast.error("बिल अस्वीकृत / Bill rejected");
  };

  const openEditBill = (bill: DailyClassBill) => {
    setEditBill(bill);
    setEditForm({
      date: bill.date,
      hoursTaught: String(bill.hoursTaught),
      ratePerHour: String(bill.ratePerHour),
      adminComment: bill.adminComment ?? "",
    });
  };

  const handleSaveEditBill = () => {
    if (!editBill) return;
    const hours = Number(editForm.hoursTaught);
    const rate = Number(editForm.ratePerHour);
    if (Number.isNaN(hours) || Number.isNaN(rate) || hours <= 0) {
      toast.error("Invalid hours or rate");
      return;
    }
    const totalAmount = hours * rate;
    updateBill(editBill.id, {
      date: editForm.date,
      hoursTaught: hours,
      ratePerHour: rate,
      totalAmount,
      adminComment: editForm.adminComment || undefined,
    });
    setEditBill(null);
    toast.success("बिल अपडेट / Bill updated");
  };

  const handleDelete = (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (bill && (bill.status === "Approved" || bill.status === "Checked")) {
      toast.error(
        "Cannot delete approved/checked bills / अनुमोदित बिल हटाए नहीं जा सकते",
      );
      setDeleteId(null);
      return;
    }
    deleteBill(id);
    setDeleteId(null);
    toast.success("बिल हटाया / Bill deleted");
  };

  const exportExcel = () => {
    const data = monthlyReport.map((row) => ({
      Faculty: row.teacherName,
      "Hours Taught": row.hours,
      Bills: row.bills,
      "Gross (₹)": row.gross,
      "TDS 10% (₹)": row.tds,
      "Net (₹)": row.net,
    }));
    exportToExcel(
      data,
      "Billing Report",
      `billing_report_${reportYear}_${reportMonth}.xlsx`,
    )
      .then(() => toast.success("Excel exported"))
      .catch(() => toast.error("Export failed"));
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
            {checkedBills.length} bills awaiting approval &bull; TDS 10%
            deducted on every bill
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
                  <TableHead>Gross (₹)</TableHead>
                  <TableHead>TDS 10% (₹)</TableHead>
                  <TableHead>Net (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkedBills.map((bill, i) => {
                  const teacher = getFacultyById(bill.teacherId);
                  const tds = calcTds(bill.totalAmount);
                  const net = calcNet(bill.totalAmount);
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
                      <TableCell className="text-sm font-semibold text-green-700">
                        ₹{bill.totalAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-destructive">
                        ₹{tds.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm font-bold">
                        ₹{net.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <BillStatusBadge status={bill.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedBill(bill);
                              setAdminComment("");
                            }}
                            data-ocid={`billing.review_button.${i + 1}`}
                          >
                            Review
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => openEditBill(bill)}
                            data-ocid={`billing.edit_button.${i + 1}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {checkedBills.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
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
                  onClick={exportExcel}
                  data-ocid="billing.download.button"
                >
                  <Download className="w-3 h-3 mr-1" /> Export Excel
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
                label: "TDS Deducted (10%)",
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
                    <TableHead>TDS 10% (₹)</TableHead>
                    <TableHead>Net (₹)</TableHead>
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
                      <TableCell className="text-sm text-green-700 font-semibold">
                        {row.gross.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-destructive">
                        {row.tds.toLocaleString("en-IN")}
                        <Badge className="ml-1 bg-red-100 text-red-700 border-red-200 text-[10px]">
                          10%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-bold">
                        {row.net.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {monthlyReport.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
          {selectedBill &&
            (() => {
              const tds = calcTds(selectedBill.totalAmount);
              const net = calcNet(selectedBill.totalAmount);
              return (
                <div className="space-y-3">
                  <div className="bg-secondary rounded-lg p-3 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Teacher:</span>{" "}
                        {getFacultyById(selectedBill.teacherId)?.name}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>{" "}
                        {new Date(selectedBill.date).toLocaleDateString(
                          "en-IN",
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hours:</span>{" "}
                        {selectedBill.hoursTaught}h
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate:</span> ₹
                        {selectedBill.ratePerHour}/hr
                      </div>
                    </div>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Gross / सकल:
                        </span>
                        <span className="font-semibold text-green-700">
                          ₹{selectedBill.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          TDS @ 10%:
                        </span>
                        <span className="text-destructive">
                          − ₹{tds.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-bold text-sm">
                        <span>Net Payable / नेट देय:</span>
                        <span>₹{net.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    {selectedBill.checkerComment && (
                      <div className="border-t pt-2">
                        <span className="text-muted-foreground">
                          Checker Note:
                        </span>{" "}
                        {selectedBill.checkerComment}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">
                      अडमिन टिप्पणी / Admin Comment
                    </Label>
                    <Textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Optional comment..."
                      className="mt-1 text-sm h-20"
                      data-ocid="billing_review.textarea"
                    />
                  </div>
                </div>
              );
            })()}
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
              onClick={handleRejectBill}
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

      {/* Edit Bill Dialog */}
      <Dialog open={!!editBill} onOpenChange={() => setEditBill(null)}>
        <DialogContent data-ocid="billing.edit.dialog">
          <DialogHeader>
            <DialogTitle>बिल संपादित करें / Edit Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Date / तारीख</Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="billing.edit.date.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Hours Taught / कक्षाएं</Label>
                <Input
                  type="number"
                  value={editForm.hoursTaught}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, hoursTaught: e.target.value }))
                  }
                  data-ocid="billing.edit.hours.input"
                />
              </div>
              <div>
                <Label className="text-xs">Rate Per Hour / दर</Label>
                <Input
                  type="number"
                  value={editForm.ratePerHour}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, ratePerHour: e.target.value }))
                  }
                  data-ocid="billing.edit.rate.input"
                />
              </div>
            </div>
            {editForm.hoursTaught && editForm.ratePerHour && (
              <div className="bg-secondary rounded p-2 text-xs">
                Total: ₹
                {(
                  Number(editForm.hoursTaught) * Number(editForm.ratePerHour)
                ).toLocaleString("en-IN")}
              </div>
            )}
            <div>
              <Label className="text-xs">Admin Comment</Label>
              <Textarea
                value={editForm.adminComment}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, adminComment: e.target.value }))
                }
                rows={2}
                data-ocid="billing.edit.comment.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditBill(null)}
              data-ocid="billing.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditBill}
              data-ocid="billing.edit.save_button"
            >
              Save / सहेजें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bill Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="billing.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Only Draft/Rejected bills can be deleted. Approved or Checked
              bills cannot be removed. / केवल ड्राफ्ट/अस्वीकृत बिल हटाए जा सकते हैं।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="billing.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="billing.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
