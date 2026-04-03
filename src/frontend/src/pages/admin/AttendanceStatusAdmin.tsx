import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCourseStore } from "../../store/useCourseStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useStudentAttendanceStore } from "../../store/useStudentAttendanceStore";

const MONTHS = [
  { value: "2026-01", label: "January 2026" },
  { value: "2025-12", label: "December 2025" },
  { value: "2025-11", label: "November 2025" },
  { value: "2025-10", label: "October 2025" },
  { value: "2025-09", label: "September 2025" },
  { value: "2025-08", label: "August 2025" },
];

export function AttendanceStatusAdmin() {
  const { submissions, getRecordsBySubmission } = useStudentAttendanceStore();
  const { assignments } = useCourseStore();
  const { faculty } = useFacultyStore();

  const [filterMonth, setFilterMonth] = useState("2026-01");

  const teachers = faculty.filter((f) => f.role === "teacher");

  // Build status grid: for each assignment, check if submitted for the selected month
  const statusGrid = assignments.map((a) => {
    const sub = submissions.find(
      (s) =>
        s.teacherId === a.teacherId &&
        s.className === a.className &&
        s.paperCode === a.paperCode &&
        s.month === filterMonth,
    );
    const teacher = teachers.find((t) => t.id === a.teacherId);
    return {
      assignment: a,
      teacher,
      submission: sub,
      submitted: !!sub,
    };
  });

  const submitted = statusGrid.filter((s) => s.submitted).length;
  const pending = statusGrid.filter((s) => !s.submitted).length;

  const downloadReport = () => {
    const rows: string[] = [
      "Teacher,Class,Subject,Paper Code,Month,Status,Total Students",
    ];
    for (const s of statusGrid) {
      rows.push(
        `"${s.teacher?.name ?? s.assignment.teacherName}","${s.assignment.className}","${s.assignment.subjectName}","${s.assignment.paperCode}","${filterMonth}","${s.submitted ? "Submitted" : "Pending"}","${s.submission?.totalStudents ?? 0}"`,
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_status_${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const downloadConsolidated = () => {
    const rows: string[] = [
      "Student Name,Roll Number,Class,Subject,Paper Code,Month,Total Classes,Total Present,Absent,Leave,Attendance %",
    ];
    for (const sub of submissions.filter((s) => s.month === filterMonth)) {
      const recs = getRecordsBySubmission(sub.id);
      for (const r of recs) {
        const pct =
          sub.id && r.totalClasses > 0
            ? ((r.presentCount / r.totalClasses) * 100).toFixed(1)
            : "0";
        rows.push(
          `"${r.studentName}","${r.rollNumber}","${sub.className}","${sub.subjectName}","${sub.paperCode}","${sub.month}","${r.totalClasses}","${r.presentCount}","${r.absentCount}","${r.leaveCount}","${pct}%"`,
        );
      }
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consolidated_attendance_${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Consolidated report downloaded");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Status
            </h1>
            <p className="text-gray-500 text-sm">
              Monitor faculty attendance submissions month-wise
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadReport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Status Report
          </Button>
          <Button
            onClick={downloadConsolidated}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Consolidated Report
          </Button>
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Select Month:</span>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">
              {statusGrid.length}
            </div>
            <div className="text-sm text-blue-600">Total Assignments</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{submitted}</div>
            <div className="text-sm text-green-600">Submitted</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-700">{pending}</div>
            <div className="text-sm text-red-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Alerts */}
      {pending > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-700 text-base">
              <AlertTriangle className="w-5 h-5" /> Pending Attendance
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statusGrid
                .filter((s) => !s.submitted)
                .map((s) => (
                  <div
                    key={s.assignment.id + s.assignment.teacherId}
                    className="flex items-center gap-2 text-sm text-orange-800"
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <strong>
                      {s.teacher?.name ?? s.assignment.teacherName}
                    </strong>{" "}
                    has not submitted attendance for
                    <strong>{s.assignment.className}</strong> -{" "}
                    {s.assignment.subjectName} ({s.assignment.paperCode})
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submission Status Grid</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Paper Code</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Students</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusGrid.map((s) => (
                  <TableRow
                    key={`${s.assignment.id}-${filterMonth}`}
                    className={!s.submitted ? "bg-red-50" : ""}
                  >
                    <TableCell className="font-medium">
                      {s.teacher?.name ?? s.assignment.teacherName}
                    </TableCell>
                    <TableCell>{s.assignment.className}</TableCell>
                    <TableCell>{s.assignment.subjectName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.assignment.paperCode}</Badge>
                    </TableCell>
                    <TableCell>
                      {MONTHS.find((m) => m.value === filterMonth)?.label}
                    </TableCell>
                    <TableCell>
                      {s.submitted ? (
                        <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{s.submission?.totalStudents ?? "-"}</TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {s.submission
                        ? new Date(
                            s.submission.submittedAt,
                          ).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {statusGrid.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500 py-8"
                    >
                      No faculty assignments found. Go to Course Management to
                      add assignments.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
