import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  Layers,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  RATE_PER_HOUR,
  calcNet,
  calcTds,
  useBillingStore,
} from "../../store/useBillingStore";
import { useCourseClassStore } from "../../store/useCourseClassStore";
import { useCourseStore } from "../../store/useCourseStore";
import { useDepartmentStore } from "../../store/useDepartmentStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { FacultyProfile } from "../../types/models";

const CURRENT_TEACHER_ID = "teacher-1";

const TIME_OPTIONS = [
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
];

function parseHour(timeStr: string): number {
  const [hourStr, period] = timeStr.split(" ");
  let hour = Number.parseInt(hourStr, 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour;
}

function getEndTimeOptions(startTime: string): string[] {
  if (!startTime) return TIME_OPTIONS;
  const startHour = parseHour(startTime);
  return TIME_OPTIONS.filter((t) => parseHour(t) > startHour);
}

function getMonthYear(dateStr: string): { month: string; year: string } {
  if (!dateStr) return { month: "", year: "" };
  const dt = new Date(dateStr);
  const month = dt.toLocaleString("en-IN", { month: "long" });
  const year = dt.getFullYear().toString();
  return { month, year };
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getMonthKey(dateStr: string): string {
  if (!dateStr) return "";
  const dt = new Date(dateStr);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Draft: "bg-muted text-muted-foreground",
    Submitted: "bg-blue-100 text-blue-700",
    Checked: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

interface Props {
  profile?: FacultyProfile | null;
}

export function FacultyBillEntry({ profile: _profile }: Props) {
  const { bills, addBill, updateBillStatus, deleteBill } = useBillingStore();
  const { courses, getDepartmentsByTeacher, getAssignmentsByDeptAndTeacher } =
    useCourseStore();
  const { getDepartmentById } = useDepartmentStore();
  const { subjects, entries: timetableEntries, rooms } = useTimetableStore();
  const { getMonthlyLimit, getMonthlyTotal } = useCourseClassStore();

  // ---- Dialog open state ----
  const [dialogOpen, setDialogOpen] = useState(false);

  // ---- Form state ----
  const [selDept, setSelDept] = useState("");
  const [selCourse, setSelCourse] = useState("");
  const [selClass, setSelClass] = useState("");
  const [selSubject, setSelSubject] = useState("");
  const [selDate, setSelDate] = useState("");
  const [selStartTime, setSelStartTime] = useState("");
  const [selEndTime, setSelEndTime] = useState("");
  const [remarks, setRemarks] = useState("");

  // ---- Filter state ----
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const today = getTodayString();

  // ---- Teacher's departments ----
  const teacherDeptIds = useMemo(
    () => getDepartmentsByTeacher(CURRENT_TEACHER_ID),
    [getDepartmentsByTeacher],
  );

  const teacherDepts = useMemo(
    () =>
      teacherDeptIds
        .map((id) => getDepartmentById(id))
        .filter(Boolean)
        .map((d) => d!),
    [teacherDeptIds, getDepartmentById],
  );

  // ---- Courses for selected dept ----
  const deptAssignments = useMemo(() => {
    if (!selDept) return [];
    return getAssignmentsByDeptAndTeacher(CURRENT_TEACHER_ID, selDept);
  }, [selDept, getAssignmentsByDeptAndTeacher]);

  const deptCourseIds = useMemo(
    () => [...new Set(deptAssignments.map((a) => a.courseId))],
    [deptAssignments],
  );

  const deptCourses = useMemo(
    () => courses.filter((c) => deptCourseIds.includes(c.id)),
    [courses, deptCourseIds],
  );

  // ---- Classes for selected course ----
  const courseAssignments = useMemo(() => {
    if (!selCourse) return [];
    return deptAssignments.filter((a) => a.courseId === selCourse);
  }, [selCourse, deptAssignments]);

  const classOptions = useMemo(
    () => [...new Set(courseAssignments.map((a) => a.className))],
    [courseAssignments],
  );

  // ---- Subjects for selected class ----
  const classAssignments = useMemo(() => {
    if (!selClass) return [];
    return courseAssignments.filter((a) => a.className === selClass);
  }, [selClass, courseAssignments]);

  // ---- Selected assignment (by subject) ----
  const selectedAssignment = useMemo(
    () => classAssignments.find((a) => a.subjectName === selSubject) ?? null,
    [classAssignments, selSubject],
  );

  // ---- Paper code (auto from assignment) ----
  const paperCode = selectedAssignment?.paperCode ?? "";

  // ---- Room no from timetable ----
  const roomNo = useMemo(() => {
    if (!paperCode) return "";
    const subjectMatch = subjects.find((s) => s.code === paperCode);
    if (!subjectMatch)
      return "Not scheduled / \u0936\u0947\u0921\u094d\u092f\u0942\u0932 \u0928\u0939\u0940\u0902";
    const entry = timetableEntries.find(
      (e) =>
        e.subjectId === subjectMatch.id && e.teacherId === CURRENT_TEACHER_ID,
    );
    if (!entry)
      return "Not scheduled / \u0936\u0947\u0921\u094d\u092f\u0942\u0932 \u0928\u0939\u0940\u0902";
    const room = rooms.find((r) => r.id === entry.roomId);
    return (
      room?.name ??
      "Not scheduled / \u0936\u0947\u0921\u094d\u092f\u0942\u0932 \u0928\u0939\u0940\u0902"
    );
  }, [paperCode, subjects, timetableEntries, rooms]);

  // ---- Hours calculation ----
  const hoursCalculated = useMemo(() => {
    if (!selStartTime || !selEndTime) return 0;
    return parseHour(selEndTime) - parseHour(selStartTime);
  }, [selStartTime, selEndTime]);

  // ---- Amount preview ----
  const gross = hoursCalculated * RATE_PER_HOUR;
  const tds = calcTds(gross);
  const net = calcNet(gross);

  // ---- Monthly limit check ----
  const monthKey = getMonthKey(selDate);
  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selCourse) ?? null,
    [courses, selCourse],
  );
  const monthlyLimit = selectedCourse ? getMonthlyLimit(selCourse) : 45000;
  const monthlyUsed =
    selClass && monthKey ? getMonthlyTotal(selClass, monthKey) : 0;
  const wouldExceedLimit = gross > 0 && monthlyUsed + gross > monthlyLimit;

  // ---- Filtered bills for this teacher ----
  const teacherBills = useMemo(
    () =>
      bills
        .filter((b) => b.teacherId === CURRENT_TEACHER_ID)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [bills],
  );

  const filteredBills = useMemo(() => {
    return teacherBills.filter((b) => {
      if (filterMonth && !getMonthKey(b.date).endsWith(filterMonth))
        return false;
      if (filterStatus && b.status !== filterStatus) return false;
      return true;
    });
  }, [teacherBills, filterMonth, filterStatus]);

  // Unique months for filter
  const availableMonths = useMemo(() => {
    const months = [
      ...new Set(teacherBills.map((b) => getMonthKey(b.date))),
    ].sort();
    return months;
  }, [teacherBills]);

  // Monthly usage for progress bars (unique class+month combos)
  const monthlyUsageData = useMemo(() => {
    const map = new Map<
      string,
      {
        className: string;
        month: string;
        used: number;
        limit: number;
        courseId: string;
      }
    >();
    for (const b of teacherBills.filter((b) => b.className && b.courseId)) {
      const mk = getMonthKey(b.date);
      const key = `${b.className}__${mk}`;
      if (!map.has(key)) {
        const limit = b.courseId ? getMonthlyLimit(b.courseId) : 45000;
        map.set(key, {
          className: b.className!,
          month: mk,
          used: 0,
          limit,
          courseId: b.courseId ?? "",
        });
      }
      const item = map.get(key)!;
      if (b.status !== "Rejected") {
        item.used += b.totalAmount;
      }
    }
    return [...map.values()];
  }, [teacherBills, getMonthlyLimit]);

  // ---- Reset form ----
  function resetForm() {
    setSelDept("");
    setSelCourse("");
    setSelClass("");
    setSelSubject("");
    setSelDate("");
    setSelStartTime("");
    setSelEndTime("");
    setRemarks("");
  }

  // ---- Validate & Submit ----
  function canSubmitForm() {
    return (
      selDept &&
      selCourse &&
      selClass &&
      selSubject &&
      selDate &&
      selStartTime &&
      selEndTime &&
      hoursCalculated > 0 &&
      !wouldExceedLimit
    );
  }

  function handleAddEntry() {
    if (!canSubmitForm()) return;
    const { month, year } = getMonthYear(selDate);

    addBill({
      teacherId: CURRENT_TEACHER_ID,
      date: selDate,
      subjectId: selectedAssignment?.id ?? "",
      batchId: "",
      hoursTaught: hoursCalculated,
      ratePerHour: RATE_PER_HOUR,
      totalAmount: gross,
      status: "Draft",
      departmentId: selDept,
      courseId: selCourse,
      className: selClass,
      subjectName: selSubject,
      paperCode,
      roomNo,
      startTime: selStartTime,
      endTime: selEndTime,
      hoursCalculated,
      remarks: remarks || undefined,
      checkerComment: undefined,
      adminComment: undefined,
    });

    toast.success(
      `Bill entry added for ${selSubject} (${month} ${year}) \u2014 \u20b9${gross.toLocaleString("en-IN")} gross`,
    );
    setDialogOpen(false);
    resetForm();
  }

  function handleSubmitBill(billId: string) {
    updateBillStatus(billId, "Submitted");
    toast.success(
      "Bill submitted for review / \u092c\u093f\u0932 \u0938\u092e\u0940\u0915\u094d\u0937\u093e \u0915\u0947 \u0932\u093f\u090f \u091c\u092e\u093e \u0915\u093f\u092f\u093e",
    );
  }

  function handleDeleteBill(billId: string) {
    deleteBill(billId);
    toast.success(
      "Bill entry deleted / \u092c\u093f\u0932 \u092a\u094d\u0930\u0935\u093f\u0937\u094d\u091f\u093f \u0939\u091f\u093e\u0908 \u0917\u0908",
    );
  }

  // ---- Dept change cascade ----
  function onDeptChange(val: string) {
    setSelDept(val);
    setSelCourse("");
    setSelClass("");
    setSelSubject("");
  }

  function onCourseChange(val: string) {
    setSelCourse(val);
    setSelClass("");
    setSelSubject("");
  }

  function onClassChange(val: string) {
    setSelClass(val);
    setSelSubject("");
  }

  function onStartTimeChange(val: string) {
    setSelStartTime(val);
    setSelEndTime("");
  }

  const { month: derivedMonth, year: derivedYear } = getMonthYear(selDate);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bill Entry{" "}
            <span className="text-muted-foreground font-normal text-lg">
              / \u092c\u093f\u0932
              \u092a\u094d\u0930\u0935\u093f\u0937\u094d\u091f\u093f
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit your daily class hours for billing &amp; approval
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              data-ocid="bill_entry.open_modal_button"
            >
              <Plus className="w-4 h-4" />
              Add New Entry / \u0928\u0908
              \u092a\u094d\u0930\u0935\u093f\u0937\u094d\u091f\u093f
            </Button>
          </DialogTrigger>

          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            data-ocid="bill_entry.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-lg">
                New Bill Entry / \u0928\u0908 \u092c\u093f\u0932
                \u092a\u094d\u0930\u0935\u093f\u0937\u094d\u091f\u093f
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Row 1: Department + Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Department / \u0935\u093f\u092d\u093e\u0917{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selDept} onValueChange={onDeptChange}>
                    <SelectTrigger data-ocid="bill_entry.select">
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherDepts.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No departments assigned
                        </SelectItem>
                      ) : (
                        teacherDepts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} \u2014 {d.nameHindi}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Course / \u0915\u094b\u0930\u094d\u0938{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selCourse}
                    onValueChange={onCourseChange}
                    disabled={!selDept}
                  >
                    <SelectTrigger data-ocid="bill_entry.select">
                      <SelectValue
                        placeholder={
                          selDept ? "Select course..." : "Select dept first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {deptCourses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} \u2014 {c.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Class + Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Class / \u0915\u0915\u094d\u0937\u093e{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selClass}
                    onValueChange={onClassChange}
                    disabled={!selCourse}
                  >
                    <SelectTrigger data-ocid="bill_entry.select">
                      <SelectValue
                        placeholder={
                          selCourse ? "Select class..." : "Select course first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map((cn) => (
                        <SelectItem key={cn} value={cn}>
                          {cn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Subject / \u0935\u093f\u0937\u092f{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selSubject}
                    onValueChange={setSelSubject}
                    disabled={!selClass}
                  >
                    <SelectTrigger data-ocid="bill_entry.select">
                      <SelectValue
                        placeholder={
                          selClass ? "Select subject..." : "Select class first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {classAssignments.map((a) => (
                        <SelectItem key={a.id} value={a.subjectName}>
                          {a.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Paper Code + Room */}
              {selSubject && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Paper Code / \u092a\u0947\u092a\u0930 \u0915\u094b\u0921
                    </Label>
                    <div className="flex items-center h-10 px-3 rounded-md border border-border bg-muted text-muted-foreground text-sm font-mono">
                      {paperCode || "\u2014"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Room No / \u0915\u0915\u094d\u0937
                      \u0928\u0902\u092c\u0930
                    </Label>
                    <div className="flex items-center h-10 px-3 rounded-md border border-border bg-muted text-muted-foreground text-sm">
                      {roomNo || "\u2014"}
                    </div>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Date / \u0926\u093f\u0928\u093e\u0902\u0915{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <input
                  type="date"
                  max={today}
                  value={selDate}
                  onChange={(e) => setSelDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  data-ocid="bill_entry.input"
                />
                {selDate && (
                  <p className="text-xs text-muted-foreground">
                    Month:{" "}
                    <span className="font-semibold text-foreground">
                      {derivedMonth}
                    </span>{" "}
                    &nbsp; Year:{" "}
                    <span className="font-semibold text-foreground">
                      {derivedYear}
                    </span>
                  </p>
                )}
              </div>

              {/* Start Time + End Time + Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Start Time / \u092a\u094d\u0930\u093e\u0930\u0902\u092d{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selStartTime}
                    onValueChange={onStartTimeChange}
                  >
                    <SelectTrigger data-ocid="bill_entry.select">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    End Time / \u0938\u092e\u093e\u092a\u094d\u0924\u093f{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selEndTime}
                    onValueChange={setSelEndTime}
                    disabled={!selStartTime}
                  >
                    <SelectTrigger data-ocid="bill_entry.select">
                      <SelectValue
                        placeholder={
                          selStartTime ? "End time" : "Select start first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getEndTimeOptions(selStartTime).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Hours / \u0918\u0902\u091f\u0947
                  </Label>
                  <div
                    className={`flex items-center justify-center h-10 rounded-md border text-lg font-bold ${
                      hoursCalculated > 0
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {hoursCalculated > 0 ? hoursCalculated : "\u2014"}
                  </div>
                </div>
              </div>

              {/* Amount Preview */}
              {hoursCalculated > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-card p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Gross / \u0938\u0915\u0932
                    </p>
                    <p className="text-base font-bold text-foreground mt-1">
                      \u20b9{gross.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-center">
                    <p className="text-[10px] text-orange-600 uppercase tracking-wider">
                      TDS 10% / \u091f\u0940\u0921\u0940\u090f\u0938
                    </p>
                    <p className="text-base font-bold text-orange-700 mt-1">
                      \u2212\u20b9{tds.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                    <p className="text-[10px] text-green-700 uppercase tracking-wider">
                      Net / \u0928\u093f\u0935\u0932
                    </p>
                    <p className="text-base font-bold text-green-700 mt-1">
                      \u20b9{net.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              )}

              {/* Monthly limit warning */}
              {wouldExceedLimit && selClass && (
                <div
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                  data-ocid="bill_entry.error_state"
                >
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive">
                      Monthly limit exceeded / \u092e\u093e\u0938\u093f\u0915
                      \u0938\u0940\u092e\u093e \u092a\u093e\u0930
                    </p>
                    <p className="text-destructive/80 text-xs mt-0.5">
                      Class {selClass} has used \u20b9
                      {monthlyUsed.toLocaleString("en-IN")} of \u20b9
                      {monthlyLimit.toLocaleString("en-IN")} limit. Adding
                      \u20b9{gross.toLocaleString("en-IN")} would exceed it.
                    </p>
                  </div>
                </div>
              )}

              {/* Remarks */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  Remarks / \u091f\u093f\u092a\u094d\u092a\u0923\u0940{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional \u2014 if not as per master timetable /
                    \u092e\u093e\u0938\u094d\u091f\u0930
                    \u091f\u093e\u0907\u092e\u091f\u0947\u092c\u0932
                    \u0905\u0928\u0941\u0938\u093e\u0930
                    \u0928\u0939\u0940\u0902)
                  </span>
                </Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Explain any deviation from master timetable..."
                  rows={3}
                  className="resize-none"
                  data-ocid="bill_entry.textarea"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                data-ocid="bill_entry.cancel_button"
              >
                Cancel / \u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902
              </Button>
              <Button
                onClick={handleAddEntry}
                disabled={!canSubmitForm()}
                data-ocid="bill_entry.submit_button"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Entry /
                \u092a\u094d\u0930\u0935\u093f\u0937\u094d\u091f\u093f
                \u091c\u094b\u0921\u093c\u0947\u0902
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly Usage Progress */}
      {monthlyUsageData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Monthly Class Billing Usage / \u092e\u093e\u0938\u093f\u0915
              \u0915\u0915\u094d\u0937\u093e
              \u092c\u093f\u0932\u093f\u0902\u0917
              \u0909\u092a\u092f\u094b\u0917
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyUsageData.map((item, i) => {
                const pct = Math.min(
                  Math.round((item.used / item.limit) * 100),
                  100,
                );
                const isNearLimit = pct >= 80;
                return (
                  <div key={`${item.className}-${item.month}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium truncate max-w-[50%]">
                        {item.className}
                      </span>
                      <span
                        className={`font-semibold ${
                          isNearLimit
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        \u20b9{item.used.toLocaleString("en-IN")} / \u20b9
                        {item.limit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className={`h-2 ${
                        isNearLimit ? "[&>div]:bg-destructive" : ""
                      }`}
                      data-ocid={`bill_entry.item.${i + 1}`}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {item.month} &mdash; {pct}% used
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Month
          </Label>
          <Select
            value={filterMonth || "all"}
            onValueChange={(v) => setFilterMonth(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {availableMonths.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Status
          </Label>
          <Select
            value={filterStatus || "all"}
            onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {["Draft", "Submitted", "Checked", "Approved", "Rejected"].map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {filteredBills.length} entr
          {filteredBills.length !== 1 ? "ies" : "y"}
        </span>
      </div>

      {/* Bill Entries Table */}
      <Card>
        <CardContent className="p-0">
          {filteredBills.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-muted-foreground"
              data-ocid="bill_entry.empty_state"
            >
              <IndianRupee className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">
                No bill entries found / \u0915\u094b\u0908 \u092c\u093f\u0932
                \u092a\u094d\u0930\u0935\u093f\u0937\u094d\u091f\u093f
                \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940
              </p>
              <p className="text-xs mt-1">
                Add your first class entry using the button above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="bill_entry.table">
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Paper</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Hrs</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">TDS</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill, idx) => {
                    const g = bill.totalAmount;
                    const t = calcTds(g);
                    const n = calcNet(g);
                    const dept = bill.departmentId
                      ? getDepartmentById(bill.departmentId)
                      : null;
                    const course = bill.courseId
                      ? courses.find((c) => c.id === bill.courseId)
                      : null;
                    return (
                      <TableRow
                        key={bill.id}
                        className="text-xs"
                        data-ocid={`bill_entry.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {bill.date}
                        </TableCell>
                        <TableCell
                          className="max-w-[80px] truncate"
                          title={dept?.name}
                        >
                          {dept?.name ?? bill.departmentId ?? "\u2014"}
                        </TableCell>
                        <TableCell
                          className="max-w-[70px] truncate"
                          title={course?.name}
                        >
                          {course?.name ?? "\u2014"}
                        </TableCell>
                        <TableCell
                          className="max-w-[110px] truncate"
                          title={bill.className}
                        >
                          {bill.className ?? "\u2014"}
                        </TableCell>
                        <TableCell
                          className="max-w-[110px] truncate"
                          title={bill.subjectName}
                        >
                          {bill.subjectName ?? "\u2014"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {bill.paperCode ?? "\u2014"}
                        </TableCell>
                        <TableCell
                          className="max-w-[80px] truncate"
                          title={bill.roomNo}
                        >
                          {bill.roomNo ?? "\u2014"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {bill.startTime ?? "\u2014"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {bill.endTime ?? "\u2014"}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {bill.hoursCalculated ?? bill.hoursTaught}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          \u20b9{g.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right text-orange-600">
                          \u2212\u20b9{t.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          \u20b9{n.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell
                          className="max-w-[100px] truncate text-muted-foreground"
                          title={bill.remarks}
                        >
                          {bill.remarks ?? (
                            <span className="text-muted-foreground/40">
                              \u2014
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${statusBadge(bill.status)}`}
                          >
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {bill.status === "Draft" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs px-2 gap-1"
                                  onClick={() => handleSubmitBill(bill.id)}
                                  data-ocid={`bill_entry.submit_button.${idx + 1}`}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Submit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteBill(bill.id)}
                                  data-ocid={`bill_entry.delete_button.${idx + 1}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            {bill.status !== "Draft" && (
                              <span className="text-[10px] text-muted-foreground">
                                {bill.status}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
