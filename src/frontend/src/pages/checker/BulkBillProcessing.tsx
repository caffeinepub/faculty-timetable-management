import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckSquare as CheckSquareIcon,
  Clock as ClockIcon,
  Layers as LayersIcon,
  IndianRupee as RupeeIcon,
  XSquare as XSquareIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuditStore } from "../../store/useAuditStore";
import { useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { BillStatus } from "../../types/models";

export function BulkBillProcessing() {
  const { bills, updateBillStatus } = useBillingStore();
  const { faculty } = useFacultyStore();
  const { subjects } = useTimetableStore();
  const { addLog } = useAuditStore();

  const [statusFilter, setStatusFilter] = useState<
    "Submitted" | "Checked" | "All"
  >("Submitted");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"check" | "reject" | null>(null);
  const [bulkComment, setBulkComment] = useState("");

  const teachers = faculty.filter((f) => f.role === "teacher");

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (statusFilter !== "All" && b.status !== statusFilter) return false;
      if (teacherFilter && b.teacherId !== teacherFilter) return false;
      if (dateFrom && b.date < dateFrom) return false;
      if (dateTo && b.date > dateTo) return false;
      return true;
    });
  }, [bills, statusFilter, teacherFilter, dateFrom, dateTo]);

  const pendingBills = bills.filter((b) => b.status === "Submitted");
  const pendingAmount = pendingBills.reduce((s, b) => s + b.totalAmount, 0);

  const selectedBills = filtered.filter((b) => selected.has(b.id));
  const selectedTotal = selectedBills.reduce((s, b) => s + b.totalAmount, 0);

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedBills.length === 0) return;

    const newStatus: BillStatus =
      bulkAction === "check" ? "Checked" : "Rejected";
    const checkerName = "Mr. Amit Gupta";

    for (const bill of selectedBills) {
      updateBillStatus(bill.id, newStatus, {
        checkerComment: bulkComment || undefined,
        checkedBy: "checker-1",
      });
      const teacher = teachers.find((t) => t.id === bill.teacherId);
      addLog({
        actorId: "cred_checker",
        actorName: checkerName,
        action: `${bulkAction === "check" ? "Checked" : "Rejected"} Bill #${bill.id} (Bulk)`,
        category: "Billing",
        details: `Amount: ₹${bill.totalAmount} | Teacher: ${teacher?.name ?? bill.teacherId}`,
      });
    }

    toast.success(
      `${selectedBills.length} bills ${bulkAction === "check" ? "checked" : "rejected"} / ${selectedBills.length} बिल ${bulkAction === "check" ? "सत्यापित" : "अस्वीकृत"}`,
    );

    setSelected(new Set());
    setBulkAction(null);
    setBulkComment("");
  };

  const billStatusBadge = (status: BillStatus) => {
    const variants: Record<BillStatus, string> = {
      Draft: "bg-gray-100 text-gray-700",
      Submitted: "bg-amber-100 text-amber-800",
      Checked: "bg-blue-100 text-blue-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${variants[status] ?? ""}`}
      >
        {status}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="bulk_bill.page"
    >
      <div>
        <h1 className="text-2xl font-bold">Bulk Bill Processing</h1>
        <p className="text-sm text-muted-foreground">
          ऋण बातचीत / Review and process multiple bills at once
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: "Pending Bills",
            labelH: "लंबित बिल",
            value: pendingBills.length,
            icon: <ClockIcon className="w-5 h-5" />,
            color: "text-amber-500",
          },
          {
            label: "Pending Amount",
            labelH: "लंबित राशि",
            value: `₹${pendingAmount.toLocaleString("en-IN")}`,
            icon: <RupeeIcon className="w-5 h-5" />,
            color: "text-primary",
          },
          {
            label: "Selected",
            labelH: "चयनित",
            value: selected.size,
            icon: <LayersIcon className="w-5 h-5" />,
            color: "text-blue-500",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-card">
            <CardContent className="pt-6 pb-4">
              <div className={`mb-2 ${s.color}`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground">
                {s.labelH}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border shadow-card">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as "Submitted" | "Checked" | "All");
                setSelected(new Set());
              }}
            >
              <SelectTrigger
                className="w-32"
                data-ocid="bulk_bill.status.select"
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Checked">Checked</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={teacherFilter}
              onValueChange={(v) => {
                setTeacherFilter(v === "all" ? "" : v);
                setSelected(new Set());
              }}
            >
              <SelectTrigger
                className="w-44"
                data-ocid="bulk_bill.teacher.select"
              >
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setSelected(new Set());
              }}
              className="w-36"
              data-ocid="bulk_bill.date_from.input"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setSelected(new Set());
              }}
              className="w-36"
              data-ocid="bulk_bill.date_to.input"
            />
            <span className="self-center text-sm text-muted-foreground ml-auto">
              {filtered.length} bills
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg"
          data-ocid="bulk_bill.action_bar"
        >
          <span className="text-sm font-medium">
            {selected.size} bill{selected.size !== 1 ? "s" : ""} selected
            &nbsp;|&nbsp; Total:{" "}
            <strong>₹{selectedTotal.toLocaleString("en-IN")}</strong>
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setBulkAction("check")}
              data-ocid="bulk_bill.check_button"
            >
              <CheckSquareIcon className="w-4 h-4 mr-1.5" /> Bulk Check
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkAction("reject")}
              data-ocid="bulk_bill.reject_button"
            >
              <XSquareIcon className="w-4 h-4 mr-1.5" /> Bulk Reject
            </Button>
          </div>
        </motion.div>
      )}

      {/* Bills Table */}
      <Card className="border-border shadow-card">
        <CardContent className="p-0">
          <Table data-ocid="bulk_bill.table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      filtered.length > 0 && selected.size === filtered.length
                    }
                    onCheckedChange={toggleAll}
                    data-ocid="bulk_bill.select_all.checkbox"
                  />
                </TableHead>
                <TableHead>Bill ID</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bill, i) => {
                const teacher = teachers.find((t) => t.id === bill.teacherId);
                const subject = subjects.find((s) => s.id === bill.subjectId);
                return (
                  <TableRow
                    key={bill.id}
                    className={selected.has(bill.id) ? "bg-primary/5" : ""}
                    data-ocid={`bulk_bill.item.${i + 1}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.has(bill.id)}
                        onCheckedChange={() => toggleOne(bill.id)}
                        data-ocid={`bulk_bill.checkbox.${i + 1}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {bill.id}
                    </TableCell>
                    <TableCell>{teacher?.name ?? bill.teacherId}</TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{subject?.name ?? bill.subjectId}</TableCell>
                    <TableCell>{bill.hoursTaught}h</TableCell>
                    <TableCell>
                      ₹{bill.totalAmount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>{billStatusBadge(bill.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p
              className="text-sm text-muted-foreground text-center py-8"
              data-ocid="bulk_bill.empty_state"
            >
              No bills found for selected filters / चयनित फ़िल्टर के लिए कोई बिल
              नहीं
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <Dialog
        open={!!bulkAction}
        onOpenChange={() => {
          setBulkAction(null);
          setBulkComment("");
        }}
      >
        <DialogContent data-ocid="bulk_bill.action.dialog">
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "check"
                ? "Bulk Check Bills / सत्यापित करें"
                : "Bulk Reject Bills / अस्वीकार करें"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You are about to {bulkAction} <strong>{selected.size}</strong>{" "}
            bill(s) totalling{" "}
            <strong>₹{selectedTotal.toLocaleString("en-IN")}</strong>.
          </p>
          <div>
            <Label>टिप्पणी / Comment (optional)</Label>
            <Textarea
              value={bulkComment}
              onChange={(e) => setBulkComment(e.target.value)}
              placeholder="Add a comment for all selected bills..."
              rows={3}
              data-ocid="bulk_bill.comment.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBulkAction(null);
                setBulkComment("");
              }}
              data-ocid="bulk_bill.action.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant={bulkAction === "reject" ? "destructive" : "default"}
              onClick={handleBulkAction}
              data-ocid="bulk_bill.action.confirm_button"
            >
              Confirm {bulkAction === "check" ? "Check" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
