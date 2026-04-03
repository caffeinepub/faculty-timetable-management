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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, ClipboardList, Edit2, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useLeaveStore } from "../../store/useLeaveStore";
import type { LeaveRequest } from "../../types/models";

function LeaveStatusBadge({ status }: { status: LeaveRequest["status"] }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Approved: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };
  const labelHi = { Pending: "लंबित", Approved: "अनुमोदित", Rejected: "अस्वीकृत" };
  return (
    <Badge variant="outline" className={`text-xs ${map[status]}`}>
      {status}{" "}
      <span className="text-[9px] opacity-70 ml-0.5">{labelHi[status]}</span>
    </Badge>
  );
}

export function LeaveManagement() {
  const {
    leaves,
    approveLeave,
    rejectLeave,
    updateLeave,
    deleteLeave,
    getPendingLeaves,
  } = useLeaveStore();
  const { getFacultyById } = useFacultyStore();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    leaveId: string;
    action: "approve" | "reject";
    comment: string;
  }>({ open: false, leaveId: "", action: "approve", comment: "" });

  const [editDialog, setEditDialog] = useState<LeaveRequest | null>(null);
  const [editForm, setEditForm] = useState({
    type: "Casual" as LeaveRequest["type"],
    fromDate: "",
    toDate: "",
    reason: "",
    adminComment: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const pending = getPendingLeaves();

  // Calendar view
  const [calMonth, setCalMonth] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });

  const daysInMonth = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
  const firstDay = new Date(calMonth.year, calMonth.month, 1).getDay();

  const approvedLeaves = useMemo(
    () =>
      leaves.filter((l) => {
        if (l.status !== "Approved") return false;
        const from = new Date(l.fromDate);
        return (
          from.getFullYear() === calMonth.year &&
          from.getMonth() === calMonth.month
        );
      }),
    [leaves, calMonth],
  );

  const allLeaves = useMemo(() => {
    return leaves.filter((l) => {
      if (filterTeacher !== "all" && l.teacherId !== filterTeacher)
        return false;
      if (filterStatus !== "all" && l.status !== filterStatus) return false;
      return true;
    });
  }, [leaves, filterTeacher, filterStatus]);

  const handleConfirm = () => {
    if (confirmDialog.action === "approve") {
      approveLeave(confirmDialog.leaveId, confirmDialog.comment || undefined);
      toast.success("Leave approved / छुट्टी अनुमोदित");
    } else {
      rejectLeave(confirmDialog.leaveId, confirmDialog.comment || undefined);
      toast.error("Leave rejected / छुट्टी अस्वीकृत");
    }
    setConfirmDialog((p) => ({ ...p, open: false }));
  };

  const openEdit = (leave: LeaveRequest) => {
    setEditDialog(leave);
    setEditForm({
      type: leave.type,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      reason: leave.reason,
      adminComment: leave.adminComment ?? "",
    });
  };

  const handleSaveEdit = () => {
    if (!editDialog) return;
    updateLeave(editDialog.id, {
      type: editForm.type,
      fromDate: editForm.fromDate,
      toDate: editForm.toDate,
      reason: editForm.reason,
      adminComment: editForm.adminComment || undefined,
    });
    setEditDialog(null);
    toast.success("छुट्टी अपडेट / Leave updated");
  };

  const handleDelete = (id: string) => {
    deleteLeave(id);
    setDeleteId(null);
    toast.success("छुट्टी हटायी / Leave deleted");
  };

  const MONTHS = [
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
      className="space-y-6"
      data-ocid="leaves.page"
    >
      <div>
        <h2 className="text-lg font-bold">Leave Management</h2>
        <p className="text-xs text-muted-foreground">छुट्टी प्रबंधन</p>
      </div>

      <Tabs defaultValue="pending" data-ocid="leaves.tab">
        <TabsList>
          <TabsTrigger value="pending">
            Pending{" "}
            {pending.length > 0 && (
              <Badge className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Leaves</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* PENDING */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {pending.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="leaves.pending.empty_state"
            >
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>कोई लंबित आवेदन नहीं / No pending leave requests</p>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="leaves.pending.list">
              {pending.map((leave, i) => {
                const teacher = getFacultyById(leave.teacherId);
                return (
                  <Card
                    key={leave.id}
                    className="border-border shadow-card"
                    data-ocid={`leaves.pending.item.${i + 1}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">
                              {teacher?.name ?? leave.teacherId}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {leave.type}
                            </Badge>
                            <LeaveStatusBadge status={leave.status} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(leave.fromDate).toLocaleDateString(
                              "en-IN",
                            )}{" "}
                            —{" "}
                            {new Date(leave.toDate).toLocaleDateString("en-IN")}
                          </p>
                          <p className="text-sm text-foreground mt-1">
                            {leave.reason}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Applied:{" "}
                            {new Date(leave.appliedAt).toLocaleDateString(
                              "en-IN",
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                leaveId: leave.id,
                                action: "approve",
                                comment: "",
                              })
                            }
                            data-ocid={`leaves.approve_button.${i + 1}`}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                leaveId: leave.id,
                                action: "reject",
                                comment: "",
                              })
                            }
                            data-ocid={`leaves.delete_button.${i + 1}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ALL LEAVES */}
        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="flex gap-3 flex-wrap">
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger className="w-48" data-ocid="leaves.teacher.select">
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {Array.from(new Set(leaves.map((l) => l.teacherId))).map(
                  (tid) => {
                    const t = getFacultyById(tid);
                    return (
                      <SelectItem key={tid} value={tid}>
                        {t?.name ?? tid}
                      </SelectItem>
                    );
                  },
                )}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36" data-ocid="leaves.status.select">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table data-ocid="leaves.all.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allLeaves.map((leave, i) => {
                    const teacher = getFacultyById(leave.teacherId);
                    return (
                      <TableRow
                        key={leave.id}
                        data-ocid={`leaves.all.item.${i + 1}`}
                      >
                        <TableCell className="font-medium text-sm">
                          {teacher?.name ?? leave.teacherId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {leave.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(leave.fromDate).toLocaleDateString("en-IN")}
                          {leave.fromDate !== leave.toDate &&
                            ` — ${new Date(leave.toDate).toLocaleDateString("en-IN")}`}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {leave.reason}
                        </TableCell>
                        <TableCell>
                          <LeaveStatusBadge status={leave.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(leave.appliedAt).toLocaleDateString(
                            "en-IN",
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7"
                              onClick={() => openEdit(leave)}
                              data-ocid={`leaves.edit_button.${i + 1}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(leave.id)}
                              data-ocid={`leaves.all.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {allLeaves.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="leaves.all.empty_state"
                      >
                        No leave records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CALENDAR VIEW */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCalMonth((p) => {
                  const d = new Date(p.year, p.month - 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })
              }
              data-ocid="leaves.calendar.prev_button"
            >
              ←
            </Button>
            <span className="font-semibold text-sm">
              {MONTHS[calMonth.month]} {calMonth.year}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCalMonth((p) => {
                  const d = new Date(p.year, p.month + 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })
              }
              data-ocid="leaves.calendar.next_button"
            >
              →
            </Button>
          </div>
          <Card className="border-border shadow-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold text-muted-foreground py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {["s0", "s1", "s2", "s3", "s4", "s5", "s6"]
                  .slice(0, firstDay)
                  .map((sk) => (
                    <div
                      key={`lsp-${calMonth.year}-${calMonth.month}-${sk}`}
                      aria-hidden="true"
                    />
                  ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const leavesOnDay = approvedLeaves.filter(
                      (l) => l.fromDate <= dateStr && l.toDate >= dateStr,
                    );
                    return (
                      <div
                        key={day}
                        className={`min-h-[44px] p-1 rounded-md text-xs border ${
                          leavesOnDay.length > 0
                            ? "bg-green-50 border-green-200"
                            : "border-border"
                        }`}
                      >
                        <div className="font-medium text-[11px] mb-0.5">
                          {day}
                        </div>
                        {leavesOnDay.slice(0, 2).map((l) => {
                          const t = getFacultyById(l.teacherId);
                          return (
                            <div
                              key={l.id}
                              className="bg-green-100 text-green-700 rounded px-1 text-[9px] truncate mb-0.5"
                            >
                              {t?.name?.split(" ")[0] ?? ""}
                            </div>
                          );
                        })}
                        {leavesOnDay.length > 2 && (
                          <div className="text-[9px] text-muted-foreground">
                            +{leavesOnDay.length - 2} more
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve/Reject Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(v) => setConfirmDialog((p) => ({ ...p, open: v }))}
      >
        <DialogContent data-ocid="leaves.dialog">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "approve"
                ? "Approve Leave / छुट्टी अनुमोदित करें"
                : "Reject Leave / छुट्टी अस्वीकार करें"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Optionally add a comment for the teacher.
            </p>
            <Textarea
              placeholder="Admin comment (optional)..."
              value={confirmDialog.comment}
              onChange={(e) =>
                setConfirmDialog((p) => ({ ...p, comment: e.target.value }))
              }
              data-ocid="leaves.comment.textarea"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog((p) => ({ ...p, open: false }))}
              data-ocid="leaves.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className={
                confirmDialog.action === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-destructive hover:bg-destructive/90"
              }
              data-ocid="leaves.confirm_button"
            >
              {confirmDialog.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Leave Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent data-ocid="leaves.edit.dialog">
          <DialogHeader>
            <DialogTitle>छुट्टी संपादित करें / Edit Leave</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Leave Type</Label>
              <Select
                value={editForm.type}
                onValueChange={(v) =>
                  setEditForm((p) => ({
                    ...p,
                    type: v as LeaveRequest["type"],
                  }))
                }
              >
                <SelectTrigger data-ocid="leaves.edit.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sick">Sick</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  value={editForm.fromDate}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, fromDate: e.target.value }))
                  }
                  data-ocid="leaves.edit.from_date.input"
                />
              </div>
              <div>
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  value={editForm.toDate}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, toDate: e.target.value }))
                  }
                  data-ocid="leaves.edit.to_date.input"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Reason</Label>
              <Textarea
                value={editForm.reason}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, reason: e.target.value }))
                }
                rows={3}
                data-ocid="leaves.edit.reason.textarea"
              />
            </div>
            <div>
              <Label className="text-xs">Admin Comment</Label>
              <Textarea
                value={editForm.adminComment}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, adminComment: e.target.value }))
                }
                rows={2}
                placeholder="Optional admin note..."
                data-ocid="leaves.edit.admin_comment.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(null)}
              data-ocid="leaves.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              data-ocid="leaves.edit.save_button"
            >
              Save / सहेजें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="leaves.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the leave record. / यह छुट्टी रिकॉर्ड
              स्थायी रूप से हट जाएगा।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="leaves.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="leaves.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
