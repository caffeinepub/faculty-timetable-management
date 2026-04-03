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
import { CalendarOff, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLeaveStore } from "../../store/useLeaveStore";
import type { FacultyProfile, LeaveRequest } from "../../types/models";

interface LeaveApplicationProps {
  profile: FacultyProfile;
}

const MAX_CASUAL = 12;
const MAX_SICK = 6;

function StatusBadge({ status }: { status: LeaveRequest["status"] }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Approved: "bg-green-100 text-green-700 border-green-200",
    Rejected: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <Badge variant="outline" className={`text-xs ${map[status]}`}>
      {status}
    </Badge>
  );
}

export function LeaveApplication({ profile }: LeaveApplicationProps) {
  const { addLeave, getLeavesByTeacher, getApprovedLeavesCount } =
    useLeaveStore();
  const myLeaves = useMemo(
    () =>
      getLeavesByTeacher(profile.id).sort(
        (a, b) =>
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
      ),
    [getLeavesByTeacher, profile.id],
  );

  const [applyDialog, setApplyDialog] = useState(false);
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    type: "Casual" as LeaveRequest["type"],
    reason: "",
  });

  const currentYear = new Date().getFullYear();
  const casualUsed = getApprovedLeavesCount(profile.id, "Casual", currentYear);
  const sickUsed = getApprovedLeavesCount(profile.id, "Sick", currentYear);
  const casualRemaining = Math.max(0, MAX_CASUAL - casualUsed);
  const sickRemaining = Math.max(0, MAX_SICK - sickUsed);

  const handleApply = () => {
    if (!form.fromDate || !form.toDate || !form.reason.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.fromDate > form.toDate) {
      toast.error("End date must be after start date");
      return;
    }
    addLeave({
      teacherId: profile.id,
      fromDate: form.fromDate,
      toDate: form.toDate,
      type: form.type,
      reason: form.reason,
    });
    toast.success("छुट्टी आवेदन जमा / Leave application submitted");
    setApplyDialog(false);
    setForm({ fromDate: "", toDate: "", type: "Casual", reason: "" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="leave_apply.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Leave Application</h2>
          <p className="text-xs text-muted-foreground">छुट्टी आवेदन</p>
        </div>
        <Button
          size="sm"
          onClick={() => setApplyDialog(true)}
          data-ocid="leave_apply.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Casual Leave",
            labelHi: "आकस्मिक छुट्टी",
            remaining: casualRemaining,
            used: casualUsed,
            max: MAX_CASUAL,
            color: "text-primary",
            bar: "bg-primary",
          },
          {
            label: "Sick Leave",
            labelHi: "बीमारी छुट्टी",
            remaining: sickRemaining,
            used: sickUsed,
            max: MAX_SICK,
            color: "text-destructive",
            bar: "bg-destructive",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.labelHi}
                  </p>
                </div>
                <CalendarOff className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-extrabold ${s.color}`}>
                  {s.remaining}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {s.max} remaining
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${s.bar} rounded-full transition-all`}
                  style={{ width: `${(s.used / s.max) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {s.used} used of {s.max} days
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            मेरी छुट्टियां / My Leave History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="leave_apply.table">
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLeaves.map((leave, i) => (
                <TableRow
                  key={leave.id}
                  data-ocid={`leave_apply.item.${i + 1}`}
                >
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
                    <StatusBadge status={leave.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(leave.appliedAt).toLocaleDateString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
              {myLeaves.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="leave_apply.empty_state"
                  >
                    <CalendarOff className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>कोई छुट्टी आवेदन नहीं / No leave applications</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={applyDialog} onOpenChange={setApplyDialog}>
        <DialogContent data-ocid="leave_apply.dialog">
          <DialogHeader>
            <DialogTitle>Apply for Leave / छुट्टी के लिए आवेदन करें</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Leave Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as LeaveRequest["type"] }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="leave_apply.form.type.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual">Casual (आकस्मिक)</SelectItem>
                  <SelectItem value="Sick">Sick (बीमारी)</SelectItem>
                  <SelectItem value="Other">Other (अन्य)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From Date *</Label>
                <Input
                  type="date"
                  value={form.fromDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fromDate: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="leave_apply.form.from_date.input"
                />
              </div>
              <div>
                <Label>To Date *</Label>
                <Input
                  type="date"
                  value={form.toDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, toDate: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="leave_apply.form.to_date.input"
                />
              </div>
            </div>
            <div>
              <Label>Reason *</Label>
              <Textarea
                value={form.reason}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reason: e.target.value }))
                }
                placeholder="Please provide a reason..."
                className="mt-1"
                data-ocid="leave_apply.form.reason.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApplyDialog(false)}
              data-ocid="leave_apply.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleApply} data-ocid="leave_apply.submit_button">
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
