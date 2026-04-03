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
  Calendar as CalendarIcon,
  Check as CheckIcon,
  Edit2,
  RefreshCw as RefreshCwIcon,
  Trash2,
  Users as UsersIcon,
  X as XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuditStore } from "../../store/useAuditStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useLeaveStore } from "../../store/useLeaveStore";
import { useSubstituteStore } from "../../store/useSubstituteStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { LeaveRequest, SubstituteAssignment } from "../../types/models";

function statusBadge(status: string) {
  switch (status) {
    case "Confirmed":
      return (
        <Badge variant="outline" className="text-green-600 border-green-400">
          Confirmed
        </Badge>
      );
    case "Assigned":
      return <Badge variant="secondary">Assigned</Badge>;
    case "Cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export function SubstituteManager() {
  const { leaves } = useLeaveStore();
  const {
    assignments,
    addAssignment,
    updateStatus,
    updateAssignment,
    deleteAssignment,
    getAssignmentsForLeave,
  } = useSubstituteStore();
  const { faculty } = useFacultyStore();
  const { entries, subjects } = useTimetableStore();
  const { addLog } = useAuditStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [substituteId, setSubstituteId] = useState("");
  const [note, setNote] = useState("");

  const [editDialog, setEditDialog] = useState<SubstituteAssignment | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    substituteTeacherId: "",
    status: "Assigned" as SubstituteAssignment["status"],
    note: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const teachers = faculty.filter(
    (f) => f.role === "teacher" && f.approvalStatus === "approved",
  );
  const approvedLeaves = leaves.filter((l) => l.status === "Approved");

  const unassignedLeaves = approvedLeaves.filter((l) => {
    const existing = getAssignmentsForLeave(l.id);
    return existing.length === 0;
  });

  const openAssignDialog = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setSubstituteId("");
    setNote("");
    setIsDialogOpen(true);
  };

  const handleAssign = () => {
    if (!selectedLeave || !substituteId) {
      toast.error("Please select a substitute teacher / शिक्षक चुनें");
      return;
    }

    const originalTeacher = teachers.find(
      (t) => t.id === selectedLeave.teacherId,
    );
    const subTeacher = teachers.find((t) => t.id === substituteId);
    const affectedEntries = entries.filter(
      (e) => e.teacherId === selectedLeave.teacherId,
    );

    addAssignment({
      leaveRequestId: selectedLeave.id,
      originalTeacherId: selectedLeave.teacherId,
      substituteTeacherId: substituteId,
      timetableEntryIds: affectedEntries.map((e) => e.id),
      date: selectedLeave.fromDate,
      status: "Assigned",
      note,
    });

    addLog({
      actorId: "demo-admin",
      actorName: "Dr. Rajesh Kumar",
      action: `Assigned substitute ${subTeacher?.name ?? substituteId} for ${originalTeacher?.name ?? selectedLeave.teacherId}`,
      category: "System",
      details: `Leave: ${selectedLeave.id} | Slots: ${affectedEntries.length}`,
    });

    toast.success(
      `Substitute assigned / प्रतिस्थापन शिक्षक नियुक्त: ${subTeacher?.name ?? substituteId}`,
    );
    setIsDialogOpen(false);
  };

  const openEdit = (a: SubstituteAssignment) => {
    setEditDialog(a);
    setEditForm({
      substituteTeacherId: a.substituteTeacherId,
      status: a.status,
      note: a.note ?? "",
    });
  };

  const handleSaveEdit = () => {
    if (!editDialog) return;
    updateAssignment(editDialog.id, {
      substituteTeacherId: editForm.substituteTeacherId,
      status: editForm.status,
      note: editForm.note || undefined,
    });
    setEditDialog(null);
    toast.success("नियुक्ति अपडेट / Assignment updated");
  };

  const handleCancel = (id: string) => {
    updateStatus(id, "Cancelled");
    addLog({
      actorId: "demo-admin",
      actorName: "Dr. Rajesh Kumar",
      action: "Cancelled substitute assignment",
      category: "System",
      details: `Assignment ID: ${id}`,
    });
    toast.success("Assignment cancelled / नियुक्ति रद्द की गई");
  };

  const handleDelete = (id: string) => {
    deleteAssignment(id);
    setDeleteId(null);
    toast.success("नियुक्ति हटायी / Assignment deleted");
  };

  const affectedSlots = selectedLeave
    ? entries.filter((e) => e.teacherId === selectedLeave.teacherId)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="substitute.page"
    >
      <div>
        <h1 className="text-2xl font-bold">Substitute Manager</h1>
        <p className="text-sm text-muted-foreground">
          प्रतिस्थापन प्रबंधन | Manage substitute assignments for teachers on
          approved leave
        </p>
      </div>

      {/* Pending Assignments */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-500" />
            Approved Leaves Needing Substitutes / अनुमोदित अवकाश
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unassignedLeaves.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="substitute.unassigned.empty_state"
            >
              ✅ All approved leaves have substitutes assigned / सभी अवकाशों में
              प्रतिस्थापन शिक्षक नियुक्त हैं
            </p>
          ) : (
            <div className="space-y-3" data-ocid="substitute.unassigned.list">
              {unassignedLeaves.map((leave, i) => {
                const teacher = teachers.find((t) => t.id === leave.teacherId);
                const affectedCount = entries.filter(
                  (e) => e.teacherId === leave.teacherId,
                ).length;
                return (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-amber-200 dark:border-amber-900/50"
                    data-ocid={`substitute.unassigned.item.${i + 1}`}
                  >
                    <div>
                      <p className="font-medium">
                        {teacher?.name ?? leave.teacherId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {leave.fromDate} – {leave.toDate} | {leave.type} leave |{" "}
                        {affectedCount} timetable slots affected
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {leave.reason}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openAssignDialog(leave)}
                      data-ocid={`substitute.assign_button.${i + 1}`}
                    >
                      <RefreshCwIcon className="w-3.5 h-3.5 mr-1.5" /> Assign
                      Substitute
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Assignments */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-blue-500" />
            Active Assignments / सक्रिय नियुक्तियाँ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="substitute.assignments.table">
            <TableHeader>
              <TableRow>
                <TableHead>Substitute</TableHead>
                <TableHead>Covering for</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a, i) => {
                const original = teachers.find(
                  (t) => t.id === a.originalTeacherId,
                );
                const substitute = teachers.find(
                  (t) => t.id === a.substituteTeacherId,
                );
                return (
                  <TableRow key={a.id} data-ocid={`substitute.item.${i + 1}`}>
                    <TableCell className="font-medium">
                      {substitute?.name ?? a.substituteTeacherId}
                    </TableCell>
                    <TableCell>
                      {original?.name ?? a.originalTeacherId}
                    </TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.timetableEntryIds.length}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-7 h-7"
                          onClick={() => openEdit(a)}
                          data-ocid={`substitute.edit_button.${i + 1}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        {a.status !== "Cancelled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-7 h-7 text-amber-600"
                            onClick={() => handleCancel(a.id)}
                            data-ocid={`substitute.cancel_button.${i + 1}`}
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-7 h-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(a.id)}
                          data-ocid={`substitute.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {assignments.length === 0 && (
            <p
              className="text-sm text-muted-foreground text-center py-8"
              data-ocid="substitute.assignments.empty_state"
            >
              No substitute assignments yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="substitute.dialog">
          <DialogHeader>
            <DialogTitle>
              Assign Substitute / प्रतिस्थापन शिक्षक नियुक्त करें
            </DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium">
                  {teachers.find((t) => t.id === selectedLeave.teacherId)
                    ?.name ?? selectedLeave.teacherId}
                </p>
                <p className="text-muted-foreground">
                  {selectedLeave.fromDate} – {selectedLeave.toDate} |{" "}
                  {selectedLeave.type}
                </p>
                <p className="text-muted-foreground mt-1">
                  अप्रभावित स्लॉट / Affected slots: {affectedSlots.length}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {affectedSlots.slice(0, 4).map((e) => {
                    const subj = subjects.find((s) => s.id === e.subjectId);
                    return (
                      <span
                        key={e.id}
                        className="text-xs bg-background px-2 py-0.5 rounded border"
                      >
                        {e.day} {e.startTime}–{e.endTime}:{" "}
                        {subj?.name ?? e.subjectId}
                      </span>
                    );
                  })}
                  {affectedSlots.length > 4 && (
                    <span className="text-xs text-muted-foreground">
                      +{affectedSlots.length - 4} more
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label>Select Substitute Teacher / शिक्षक का चयन करें</Label>
                <Select value={substituteId} onValueChange={setSubstituteId}>
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="substitute.teacher.select"
                  >
                    <SelectValue placeholder="Select available teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers
                      .filter((t) => t.id !== selectedLeave.teacherId)
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} — {t.department ?? ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note / टिप्पणी (optional)</Label>
                <Textarea
                  className="mt-1"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any specific instructions..."
                  data-ocid="substitute.note.textarea"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-ocid="substitute.dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              data-ocid="substitute.dialog.confirm_button"
            >
              <CheckIcon className="w-4 h-4 mr-2" /> Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent data-ocid="substitute.edit.dialog">
          <DialogHeader>
            <DialogTitle>नियुक्ति संपादित करें / Edit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Substitute Teacher</Label>
              <Select
                value={editForm.substituteTeacherId}
                onValueChange={(v) =>
                  setEditForm((p) => ({ ...p, substituteTeacherId: v }))
                }
              >
                <SelectTrigger data-ocid="substitute.edit.teacher.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) =>
                  setEditForm((p) => ({
                    ...p,
                    status: v as SubstituteAssignment["status"],
                  }))
                }
              >
                <SelectTrigger data-ocid="substitute.edit.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                value={editForm.note}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, note: e.target.value }))
                }
                placeholder="Optional note..."
                data-ocid="substitute.edit.note.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(null)}
              data-ocid="substitute.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              data-ocid="substitute.edit.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="substitute.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the substitute assignment. / यह
              नियुक्ति स्थायी रूप से हट जाएगी।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="substitute.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="substitute.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
