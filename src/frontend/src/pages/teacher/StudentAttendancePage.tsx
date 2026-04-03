import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CheckCircle2, ClipboardCheck, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCourseStore } from "../../store/useCourseStore";
import { useStudentAttendanceStore } from "../../store/useStudentAttendanceStore";
import { useStudentStore } from "../../store/useStudentStore";

const MONTHS = [
  { value: "2026-01", label: "January 2026" },
  { value: "2025-12", label: "December 2025" },
  { value: "2025-11", label: "November 2025" },
  { value: "2025-10", label: "October 2025" },
];

type AttRow = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
};

// Teacher ID simulated from auth context – in real app comes from auth hook
const CURRENT_TEACHER_ID = "teacher-1";

export function StudentAttendancePage() {
  const { getAssignmentsByTeacher } = useCourseStore();
  const { getStudentsByClass } = useStudentStore();
  const { submitAttendance, hasSubmitted } = useStudentAttendanceStore();

  const myAssignments = getAssignmentsByTeacher(CURRENT_TEACHER_ID);

  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [totalClassesField, setTotalClassesField] = useState("22");
  const [rows, setRows] = useState<AttRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const assignment = myAssignments.find((a) => a.id === selectedAssignment);
  const alreadySubmitted = assignment
    ? hasSubmitted(
        CURRENT_TEACHER_ID,
        assignment.className,
        assignment.paperCode,
        selectedMonth,
      )
    : false;

  const loadStudents = () => {
    if (!assignment) return;
    const students = getStudentsByClass(assignment.className);
    const initRows: AttRow[] = students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      rollNumber: s.rollNumber,
      totalClasses: Number(totalClassesField) || 22,
      presentCount: 0,
      absentCount: 0,
      leaveCount: 0,
    }));
    setRows(initRows);
    setLoaded(true);
  };

  const updateRow = (
    idx: number,
    field: keyof AttRow,
    value: number | string,
  ) => {
    setRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[idx], [field]: value };
      if (
        field === "presentCount" ||
        field === "absentCount" ||
        field === "leaveCount"
      ) {
        const p = field === "presentCount" ? Number(value) : row.presentCount;
        const a = field === "absentCount" ? Number(value) : row.absentCount;
        const l = field === "leaveCount" ? Number(value) : row.leaveCount;
        if (p + a + l > row.totalClasses) {
          toast.error("Present + Absent + Leave cannot exceed Total Classes");
          return prev;
        }
        updated[idx] = row;
      } else {
        updated[idx] = row;
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!assignment) return;
    if (
      rows.some(
        (r) => r.presentCount + r.absentCount + r.leaveCount > r.totalClasses,
      )
    ) {
      toast.error("Some rows have invalid attendance counts");
      return;
    }
    submitAttendance(
      {
        teacherId: CURRENT_TEACHER_ID,
        className: assignment.className,
        subjectName: assignment.subjectName,
        paperCode: assignment.paperCode,
        month: selectedMonth,
        totalStudents: rows.length,
      },
      rows,
    );
    toast.success("Attendance submitted successfully!");
    setLoaded(false);
    setRows([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <ClipboardCheck className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Attendance
          </h1>
          <p className="text-gray-500 text-sm">
            Fill and submit monthly attendance for your assigned classes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Class & Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Assigned Class - Subject</Label>
              <Select
                value={selectedAssignment}
                onValueChange={(v) => {
                  setSelectedAssignment(v);
                  setLoaded(false);
                  setRows([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment" />
                </SelectTrigger>
                <SelectContent>
                  {myAssignments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.className} - {a.subjectName} ({a.paperCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Month</Label>
              <Select
                value={selectedMonth}
                onValueChange={(v) => {
                  setSelectedMonth(v);
                  setLoaded(false);
                  setRows([]);
                }}
              >
                <SelectTrigger>
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
            <div>
              <Label>Total Classes Held</Label>
              <Input
                type="number"
                value={totalClassesField}
                onChange={(e) => setTotalClassesField(e.target.value)}
                min={1}
                max={31}
              />
            </div>
          </div>

          {alreadySubmitted && (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">
                Attendance already submitted for this class-subject-month
                combination.
              </span>
            </div>
          )}

          {!loaded && (
            <Button
              onClick={loadStudents}
              disabled={!selectedAssignment}
              className="w-full md:w-auto"
            >
              Load Students
            </Button>
          )}
        </CardContent>
      </Card>

      {loaded && rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {assignment?.className} - {assignment?.subjectName} |{" "}
                {MONTHS.find((m) => m.value === selectedMonth)?.label}
              </CardTitle>
              <Badge variant="outline">{rows.length} students</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Classes</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Leave</TableHead>
                    <TableHead>Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const pct =
                      r.totalClasses > 0
                        ? ((r.presentCount / r.totalClasses) * 100).toFixed(1)
                        : "0";
                    const pctNum = Number(pct);
                    return (
                      <TableRow key={r.studentId}>
                        <TableCell className="text-gray-500">{i + 1}</TableCell>
                        <TableCell className="font-medium">
                          {r.rollNumber}
                        </TableCell>
                        <TableCell>{r.studentName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20"
                            value={r.totalClasses}
                            onChange={(e) =>
                              updateRow(
                                i,
                                "totalClasses",
                                Number(e.target.value),
                              )
                            }
                            min={1}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20"
                            value={r.presentCount}
                            onChange={(e) =>
                              updateRow(
                                i,
                                "presentCount",
                                Number(e.target.value),
                              )
                            }
                            min={0}
                            max={r.totalClasses}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20"
                            value={r.absentCount}
                            onChange={(e) =>
                              updateRow(
                                i,
                                "absentCount",
                                Number(e.target.value),
                              )
                            }
                            min={0}
                            max={r.totalClasses}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-20"
                            value={r.leaveCount}
                            onChange={(e) =>
                              updateRow(i, "leaveCount", Number(e.target.value))
                            }
                            min={0}
                            max={r.totalClasses}
                          />
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-bold ${pctNum >= 75 ? "text-green-600" : pctNum >= 60 ? "text-orange-600" : "text-red-600"}`}
                          >
                            {pct}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Submit Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loaded && rows.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No students found for this class. Ask admin to upload student data.
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
