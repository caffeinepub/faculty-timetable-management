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
import { Card, CardContent } from "@/components/ui/card";
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
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  IndianRupee,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { exportToExcel } from "../../lib/xlsxUtils";
import { type FeeRecord, useFeeStore } from "../../store/useFeeStore";
import { useStudentStore } from "../../store/useStudentStore";

const FEE_TYPES = ["Tuition", "Exam", "Library", "Other"] as const;
const STATUSES = ["Pending", "Paid", "Overdue"] as const;
const PAYMENT_MODES = ["Cash", "Online", "Cheque"] as const;

function StatusBadge({ status }: { status: FeeRecord["status"] }) {
  const map = {
    Paid: "bg-green-100 text-green-700 border-green-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Overdue: "bg-red-100 text-red-700 border-red-200",
  };
  return <Badge className={map[status]}>{status}</Badge>;
}

const DEFAULT_FORM: Omit<FeeRecord, "id"> = {
  studentId: "",
  studentName: "",
  rollNumber: "",
  className: "",
  course: "",
  feeType: "Tuition",
  amount: 0,
  dueDate: "",
  status: "Pending",
};

export function FeeManagement() {
  const {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    markAsPaid,
    getTotalCollected,
    getTotalPending,
  } = useFeeStore();
  const { students } = useStudentStore();

  const [filterClass, setFilterClass] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [addDialog, setAddDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FeeRecord | null>(null);
  const [form, setForm] = useState<Omit<FeeRecord, "id">>(DEFAULT_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Mark paid dialog
  const [payDialog, setPayDialog] = useState<{ open: boolean; id: string }>({
    open: false,
    id: "",
  });
  const [receiptNo, setReceiptNo] = useState("");
  const [payMode, setPayMode] = useState<FeeRecord["paymentMode"]>("Cash");

  const classes = useMemo(
    () => [...new Set(records.map((r) => r.className))].sort(),
    [records],
  );

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterClass !== "all" && r.className !== filterClass) return false;
      if (filterType !== "all" && r.feeType !== filterType) return false;
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      return true;
    });
  }, [records, filterClass, filterType, filterStatus]);

  const kpi = useMemo(() => {
    const collected = getTotalCollected();
    const pending = getTotalPending();
    const overdue = records.filter((r) => r.status === "Overdue").length;
    const rate =
      records.length > 0
        ? Math.round(
            (records.filter((r) => r.status === "Paid").length /
              records.length) *
              100,
          )
        : 0;
    return { collected, pending, overdue, rate };
  }, [records, getTotalCollected, getTotalPending]);

  const openAdd = () => {
    setEditingRecord(null);
    setForm(DEFAULT_FORM);
    setAddDialog(true);
  };

  const openEdit = (r: FeeRecord) => {
    setEditingRecord(r);
    const { id: _id, ...rest } = r;
    setForm(rest);
    setAddDialog(true);
  };

  const saveRecord = () => {
    if (
      !form.studentName ||
      !form.className ||
      !form.dueDate ||
      form.amount <= 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editingRecord) {
      updateRecord(editingRecord.id, form);
      toast.success("शुल्क अपडेट / Record updated");
    } else {
      addRecord(form);
      toast.success("शुल्क रिकॉर्ड जोड़ा / Fee record added");
    }
    setAddDialog(false);
  };

  const handleMarkPaid = () => {
    if (!receiptNo) {
      toast.error("Please enter receipt number");
      return;
    }
    markAsPaid(payDialog.id, receiptNo, payMode);
    toast.success("Marked as paid!");
    setPayDialog({ open: false, id: "" });
    setReceiptNo("");
  };

  const handleDelete = (id: string) => {
    deleteRecord(id);
    setDeleteId(null);
    toast.success("शुल्क रिकॉर्ड हटाया / Record deleted");
  };

  const exportExcel = () => {
    const data = filtered.map((r) => ({
      "Student Name": r.studentName,
      "Roll No": r.rollNumber,
      Class: r.className,
      Course: r.course,
      "Fee Type": r.feeType,
      Amount: r.amount,
      "Due Date": r.dueDate,
      Status: r.status,
      "Paid Date": r.paidDate ?? "",
      "Receipt No": r.receiptNo ?? "",
      "Payment Mode": r.paymentMode ?? "",
      Remarks: r.remarks ?? "",
    }));
    exportToExcel(data, "Fee Records", "fee_management.xlsx")
      .then(() => toast.success("Excel exported"))
      .catch(() => toast.error("Export failed"));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="fee_management.page"
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Collected",
            labelHindi: "कुल संग्रहित",
            value: `₹${kpi.collected.toLocaleString()}`,
            icon: <IndianRupee className="w-5 h-5" />,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Total Pending",
            labelHindi: "कुल बकाया",
            value: `₹${kpi.pending.toLocaleString()}`,
            icon: <Clock className="w-5 h-5" />,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Overdue Count",
            labelHindi: "अतिदेय",
            value: kpi.overdue,
            icon: <AlertCircle className="w-5 h-5" />,
            color: "text-red-600 bg-red-50",
          },
          {
            label: "Collection Rate",
            labelHindi: "संग्रह दर",
            value: `${kpi.rate}%`,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "text-blue-600 bg-blue-50",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <CardContent className="p-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${k.color}`}
                >
                  {k.icon}
                </div>
                <div className="text-2xl font-bold">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-[10px] text-muted-foreground/60">
                  {k.labelHindi}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters & actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger
            className="w-44"
            data-ocid="fee_management.filter_class.select"
          >
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger
            className="w-36"
            data-ocid="fee_management.filter_type.select"
          >
            <SelectValue placeholder="Fee Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {FEE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger
            className="w-36"
            data-ocid="fee_management.filter_status.select"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={exportExcel}
          data-ocid="fee_management.export.button"
        >
          <Download className="w-4 h-4" /> Export Excel
        </Button>
        <Button
          size="sm"
          className="gap-2"
          onClick={openAdd}
          data-ocid="fee_management.add.button"
        >
          <Plus className="w-4 h-4" /> Add Fee Record
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="fee_management.table.empty_state"
                  >
                    No fee records found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((r, idx) => (
                <TableRow
                  key={r.id}
                  data-ocid={`fee_management.record.item.${idx + 1}`}
                >
                  <TableCell className="font-medium">{r.studentName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.rollNumber}
                  </TableCell>
                  <TableCell className="text-xs">{r.className}</TableCell>
                  <TableCell>{r.feeType}</TableCell>
                  <TableCell className="font-semibold">
                    ₹{r.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs">{r.dueDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.paymentMode ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {r.status !== "Paid" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 text-xs"
                          onClick={() => {
                            setPayDialog({ open: true, id: r.id });
                            setReceiptNo("");
                            setPayMode("Cash");
                          }}
                          data-ocid={`fee_management.mark_paid.button.${idx + 1}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Pay
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(r)}
                        data-ocid={`fee_management.edit.button.${idx + 1}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(r.id)}
                        data-ocid={`fee_management.delete.button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent
          className="max-w-lg"
          data-ocid="fee_management.form.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingRecord
                ? "शुल्क रिकॉर्ड संपादित करें / Edit Fee Record"
                : "Add Fee Record / शुल्क रिकॉर्ड जोड़ें"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <Label>Student Name *</Label>
              <Select
                value={form.studentId}
                onValueChange={(v) => {
                  const s = students.find((st) => st.id === v);
                  setForm((f) => ({
                    ...f,
                    studentId: v,
                    studentName: s?.name ?? f.studentName,
                    rollNumber: s?.rollNumber ?? f.rollNumber,
                    className: s?.className ?? f.className,
                    course: s?.course ?? f.course,
                  }));
                }}
              >
                <SelectTrigger data-ocid="fee_management.student.select">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.rollNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Roll Number</Label>
              <Input
                value={form.rollNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rollNumber: e.target.value }))
                }
                data-ocid="fee_management.roll_number.input"
              />
            </div>
            <div>
              <Label>Class</Label>
              <Input
                value={form.className}
                onChange={(e) =>
                  setForm((f) => ({ ...f, className: e.target.value }))
                }
                data-ocid="fee_management.class.input"
              />
            </div>
            <div>
              <Label>Fee Type *</Label>
              <Select
                value={form.feeType}
                onValueChange={(v: FeeRecord["feeType"]) =>
                  setForm((f) => ({ ...f, feeType: v }))
                }
              >
                <SelectTrigger data-ocid="fee_management.fee_type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                data-ocid="fee_management.amount.input"
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                data-ocid="fee_management.due_date.input"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: FeeRecord["status"]) =>
                  setForm((f) => ({ ...f, status: v }))
                }
              >
                <SelectTrigger data-ocid="fee_management.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Remarks</Label>
              <Textarea
                value={form.remarks ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remarks: e.target.value }))
                }
                rows={2}
                data-ocid="fee_management.remarks.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialog(false)}
              data-ocid="fee_management.cancel.button"
            >
              Cancel
            </Button>
            <Button onClick={saveRecord} data-ocid="fee_management.save.button">
              {editingRecord ? "Update" : "Add"} Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Paid Dialog */}
      <Dialog
        open={payDialog.open}
        onOpenChange={(open) => setPayDialog((p) => ({ ...p, open }))}
      >
        <DialogContent data-ocid="fee_management.pay.dialog">
          <DialogHeader>
            <DialogTitle>शुल्क भुगतान / Mark Fee as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Receipt Number *</Label>
              <Input
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder="e.g. REC-2026-001"
                data-ocid="fee_management.receipt_no.input"
              />
            </div>
            <div>
              <Label>Payment Mode</Label>
              <Select
                value={payMode}
                onValueChange={(v) => setPayMode(v as FeeRecord["paymentMode"])}
              >
                <SelectTrigger data-ocid="fee_management.pay_mode.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayDialog({ open: false, id: "" })}
              data-ocid="fee_management.pay_cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkPaid}
              data-ocid="fee_management.pay_confirm.button"
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="fee_management.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the fee record. / यह शुल्क रिकॉर्ड स्थायी
              रूप से हट जाएगा।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="fee_management.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="fee_management.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
