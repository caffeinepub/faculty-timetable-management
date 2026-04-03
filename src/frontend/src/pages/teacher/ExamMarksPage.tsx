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
import { BookOpenCheck, Save } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCourseStore } from "../../store/useCourseStore";
import { useStudentExamStore } from "../../store/useStudentExamStore";
import { useStudentStore } from "../../store/useStudentStore";

const CURRENT_TEACHER_ID = "teacher-1";

type MarkRow = {
  studentId: string;
  studentName: string;
  rollNumber: string;
  internalMarks: number;
  externalMarks: number;
};

export function ExamMarksPage() {
  const { getAssignmentsByTeacher } = useCourseStore();
  const { getStudentsByClass } = useStudentStore();
  const { saveMarks, getGrade } = useStudentExamStore();

  const myAssignments = getAssignmentsByTeacher(CURRENT_TEACHER_ID);

  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [examType, setExamType] = useState<"Internal" | "External" | "Both">(
    "Both",
  );
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const assignment = myAssignments.find((a) => a.id === selectedAssignment);

  const loadStudents = () => {
    if (!assignment) return;
    const students = getStudentsByClass(assignment.className);
    setRows(
      students.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        rollNumber: s.rollNumber,
        internalMarks: 0,
        externalMarks: 0,
      })),
    );
    setLoaded(true);
  };

  const updateRow = (
    idx: number,
    field: "internalMarks" | "externalMarks",
    value: number,
  ) => {
    setRows((prev) => {
      const updated = [...prev];
      if (field === "internalMarks" && value > 20) {
        toast.error("Internal marks max is 20");
        return prev;
      }
      if (field === "externalMarks" && value > 80) {
        toast.error("External marks max is 80");
        return prev;
      }
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!assignment || !rows.length) return;
    saveMarks(
      rows.map((r) => ({
        teacherId: CURRENT_TEACHER_ID,
        className: assignment.className,
        subjectName: assignment.subjectName,
        paperCode: assignment.paperCode,
        examType,
        studentId: r.studentId,
        studentName: r.studentName,
        rollNumber: r.rollNumber,
        internalMarks: examType !== "External" ? r.internalMarks : undefined,
        externalMarks: examType !== "Internal" ? r.externalMarks : undefined,
        maxInternal: 20,
        maxExternal: 80,
      })),
    );
    toast.success(`Marks submitted for ${rows.length} students!`);
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
        <BookOpenCheck className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Exam Marks
          </h1>
          <p className="text-gray-500 text-sm">
            Enter internal (20) + external (80) marks per student
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Class & Exam Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label>Exam Type</Label>
              <Select
                value={examType}
                onValueChange={(v) =>
                  setExamType(v as "Internal" | "External" | "Both")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Both">
                    Both (Internal + External)
                  </SelectItem>
                  <SelectItem value="Internal">
                    Internal Only (20 marks)
                  </SelectItem>
                  <SelectItem value="External">
                    External Only (80 marks)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
            <span>
              Internal: Max 20 marks | External: Max 80 marks | Total: 100 marks
            </span>
          </div>
          {!loaded && (
            <Button onClick={loadStudents} disabled={!selectedAssignment}>
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
                <Badge>{examType}</Badge>
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
                    {examType !== "External" && (
                      <TableHead>Internal (max 20)</TableHead>
                    )}
                    {examType !== "Internal" && (
                      <TableHead>External (max 80)</TableHead>
                    )}
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => {
                    const internal =
                      examType !== "External" ? r.internalMarks : 0;
                    const external =
                      examType !== "Internal" ? r.externalMarks : 0;
                    const total = internal + external;
                    const grade = getGrade(total);
                    return (
                      <TableRow key={r.studentId}>
                        <TableCell className="text-gray-500">{i + 1}</TableCell>
                        <TableCell className="font-medium">
                          {r.rollNumber}
                        </TableCell>
                        <TableCell>{r.studentName}</TableCell>
                        {examType !== "External" && (
                          <TableCell>
                            <Input
                              type="number"
                              className="w-24"
                              value={r.internalMarks}
                              min={0}
                              max={20}
                              onChange={(e) =>
                                updateRow(
                                  i,
                                  "internalMarks",
                                  Number(e.target.value),
                                )
                              }
                            />
                          </TableCell>
                        )}
                        {examType !== "Internal" && (
                          <TableCell>
                            <Input
                              type="number"
                              className="w-24"
                              value={r.externalMarks}
                              min={0}
                              max={80}
                              onChange={(e) =>
                                updateRow(
                                  i,
                                  "externalMarks",
                                  Number(e.target.value),
                                )
                              }
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-bold">{total}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              grade === "A+" || grade === "A"
                                ? "bg-green-100 text-green-700"
                                : grade === "B" || grade === "C"
                                  ? "bg-blue-100 text-blue-700"
                                  : grade === "D"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-red-100 text-red-700"
                            }
                          >
                            {grade}
                          </Badge>
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
                <Save className="w-4 h-4" /> Submit Marks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loaded && rows.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No students found. Ask admin to upload student data.
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
