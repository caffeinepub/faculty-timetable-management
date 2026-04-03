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
import { CalendarCheck, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAttendanceStore } from "../../store/useAttendanceStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useTimetableStore } from "../../store/useTimetableStore";

export function AttendanceTracker() {
  const { records, markAttendance, getAttendanceStats } = useAttendanceStore();
  const { faculty } = useFacultyStore();
  const { subjects, batches } = useTimetableStore();

  const teachers = faculty.filter(
    (f) => f.role === "teacher" && f.approvalStatus === "approved",
  );

  const [filterDate, setFilterDate] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [form, setForm] = useState({
    teacherId: "",
    subjectId: "",
    batchId: "",
    date: new Date().toISOString().split("T")[0],
    attendedCount: "",
    totalCount: "",
  });

  const filtered = records.filter((r) => {
    if (filterDate && r.date !== filterDate) return false;
    if (filterTeacher !== "all" && r.teacherId !== filterTeacher) return false;
    if (filterSubject !== "all" && r.subjectId !== filterSubject) return false;
    return true;
  });

  const stats = getAttendanceStats();

  const handleMark = () => {
    if (!form.teacherId || !form.subjectId || !form.batchId || !form.date) {
      toast.error("Please fill all required fields");
      return;
    }
    markAttendance({
      timetableEntryId: `tt-${Date.now()}`,
      teacherId: form.teacherId,
      subjectId: form.subjectId,
      batchId: form.batchId,
      date: form.date,
      attendedCount: Number(form.attendedCount) || 0,
      totalCount: Number(form.totalCount) || 0,
      markedBy: "demo-admin",
    });
    toast.success("Attendance marked successfully / उपस्थिति दर्ज की गई");
    setDialogOpen(false);
    setForm({
      teacherId: "",
      subjectId: "",
      batchId: "",
      date: new Date().toISOString().split("T")[0],
      attendedCount: "",
      totalCount: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="attendance.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Attendance Tracker</h2>
          <p className="text-xs text-muted-foreground">उपस्थिति अनुवर्तक</p>
        </div>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          data-ocid="attendance.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Avg Attendance",
            labelHi: "औसत उपस्थिति",
            value: `${stats.avgPercent}%`,
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Total Classes",
            labelHi: "कुल कक्षाएं",
            value: stats.totalClasses,
            color: "bg-blue-100 text-blue-600",
          },
          {
            label: "This Month",
            labelHi: "इस माह",
            value: stats.thisMonth,
            color: "bg-purple-100 text-purple-600",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-card">
            <CardContent className="p-4">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}
              >
                <CalendarCheck className="w-4 h-4" />
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

      {/* Filters */}
      <Card className="border-border shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-44"
              data-ocid="attendance.date.input"
            />
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger
                className="w-52"
                data-ocid="attendance.teacher.select"
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
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger
                className="w-52"
                data-ocid="attendance.subject.select"
              >
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterDate ||
              filterTeacher !== "all" ||
              filterSubject !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterDate("");
                  setFilterTeacher("all");
                  setFilterSubject("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border shadow-card">
        <CardContent className="p-0">
          <Table data-ocid="attendance.table">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Attended / Total</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => {
                const teacher = faculty.find((f) => f.id === r.teacherId);
                const subject = subjects.find((s) => s.id === r.subjectId);
                const batch = batches.find((b) => b.id === r.batchId);
                const pct =
                  r.totalCount > 0
                    ? Math.round((r.attendedCount / r.totalCount) * 100)
                    : 0;
                return (
                  <TableRow key={r.id} data-ocid={`attendance.item.${i + 1}`}>
                    <TableCell className="text-sm">
                      {new Date(r.date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {teacher?.name ?? r.teacherId}
                    </TableCell>
                    <TableCell className="text-sm">
                      {subject?.name ?? r.subjectId}
                    </TableCell>
                    <TableCell className="text-sm">
                      {batch?.name ?? r.batchId}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.attendedCount} / {r.totalCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={`${
                          pct >= 75
                            ? "border-green-300 text-green-700"
                            : pct >= 50
                              ? "border-amber-300 text-amber-700"
                              : "border-red-300 text-red-700"
                        }`}
                      >
                        {pct}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="attendance.empty_state"
                  >
                    <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No attendance records found</p>
                    <p className="text-[10px]">कोई उपस्थिति रिकॉर्ड नहीं</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mark Attendance Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="attendance.dialog">
          <DialogHeader>
            <DialogTitle>Mark Attendance / उपस्थिति दर्ज करें</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Teacher / शिक्षक *</Label>
              <Select
                value={form.teacherId}
                onValueChange={(v) => setForm((p) => ({ ...p, teacherId: v }))}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="attendance.form.teacher.select"
                >
                  <SelectValue placeholder="Select teacher" />
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
              <Label>Subject / विषय *</Label>
              <Select
                value={form.subjectId}
                onValueChange={(v) => setForm((p) => ({ ...p, subjectId: v }))}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="attendance.form.subject.select"
                >
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Batch / बैच *</Label>
              <Select
                value={form.batchId}
                onValueChange={(v) => setForm((p) => ({ ...p, batchId: v }))}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="attendance.form.batch.select"
                >
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date / तिथि *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="mt-1"
                data-ocid="attendance.form.date.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Students Present</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.attendedCount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, attendedCount: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="attendance.form.attended.input"
                />
              </div>
              <div>
                <Label>Total Students</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.totalCount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, totalCount: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="attendance.form.total.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="attendance.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleMark} data-ocid="attendance.confirm_button">
              Mark Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
