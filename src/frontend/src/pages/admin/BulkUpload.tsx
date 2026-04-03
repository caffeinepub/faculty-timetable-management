import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCourseStore } from "../../store/useCourseStore";
import { useStudentStore } from "../../store/useStudentStore";
import type { CourseAssignment, Student } from "../../types/models";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] ?? "";
    });
    return obj;
  });
}

export function BulkUpload() {
  const { addStudents } = useStudentStore();
  const { addAssignment, courses } = useCourseStore();

  const [_studentFile, setStudentFile] = useState<File | null>(null);
  const [_facultyFile, setFacultyFile] = useState<File | null>(null);
  const [studentPreview, setStudentPreview] = useState<Student[]>([]);
  const [facultyPreview, setFacultyPreview] = useState<CourseAssignment[]>([]);
  const [studentError, setStudentError] = useState("");
  const [facultyError, setFacultyError] = useState("");
  const studentRef = useRef<HTMLInputElement>(null);
  const facultyRef = useRef<HTMLInputElement>(null);

  const handleStudentFile = (file: File) => {
    setStudentFile(file);
    setStudentError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (!rows.length) {
        setStudentError("No data found. Check file format.");
        return;
      }
      const required = [
        "Student Name",
        "Roll Number",
        "Class",
        "Section",
        "Batch",
        "Course",
      ];
      const missing = required.filter((r) => !Object.keys(rows[0]).includes(r));
      if (missing.length) {
        setStudentError(`Missing columns: ${missing.join(", ")}`);
        return;
      }
      const parsed: Student[] = rows.map((r, i) => ({
        id: `preview-${i}`,
        name: r["Student Name"],
        rollNumber: r["Roll Number"],
        className: r.Class,
        section: r.Section,
        batch: r.Batch,
        enrollmentNo: r["Enrollment No"] ?? "",
        course: r.Course,
      }));
      setStudentPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleFacultyFile = (file: File) => {
    setFacultyFile(file);
    setFacultyError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (!rows.length) {
        setFacultyError("No data found. Check file format.");
        return;
      }
      const required = [
        "Teacher Name",
        "Class",
        "Subject",
        "Paper Code",
        "Course",
        "Section",
        "Batch",
      ];
      const missing = required.filter((r) => !Object.keys(rows[0]).includes(r));
      if (missing.length) {
        setFacultyError(`Missing columns: ${missing.join(", ")}`);
        return;
      }
      const parsed: CourseAssignment[] = rows.map((r, i) => {
        const course = courses.find((c) => c.name === r.Course);
        return {
          id: `preview-${i}`,
          courseId: course?.id ?? "",
          className: r.Class,
          subjectName: r.Subject,
          paperCode: r["Paper Code"],
          teacherId: `teacher-import-${i}`,
          teacherName: r["Teacher Name"],
          monthlyLimit: Number(r["Monthly Limit"]) || 45000,
          section: r.Section,
          batch: r.Batch,
        };
      });
      setFacultyPreview(parsed);
    };
    reader.readAsText(file);
  };

  const importStudents = () => {
    if (!studentPreview.length) return;
    const count = addStudents(
      studentPreview.map(({ id: _id, ...rest }) => rest),
    );
    toast.success(`${count} students imported successfully!`);
    setStudentPreview([]);
    setStudentFile(null);
    if (studentRef.current) studentRef.current.value = "";
  };

  const importFaculty = () => {
    if (!facultyPreview.length) return;
    for (const a of facultyPreview) {
      const { id: _id, ...rest } = a;
      addAssignment(rest);
    }
    toast.success(`${facultyPreview.length} faculty assignments imported!`);
    setFacultyPreview([]);
    setFacultyFile(null);
    if (facultyRef.current) facultyRef.current.value = "";
  };

  const downloadStudentTemplate = () => {
    const csv =
      "Student Name,Roll Number,Class,Section,Batch,Course,Enrollment No\nRahul Sharma,BCA24001,BCA SEMESTER I,A,2024-27,BCA,EN24001";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_upload_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFacultyTemplate = () => {
    const csv =
      "Teacher Name,Class,Subject,Paper Code,Course,Section,Batch,Monthly Limit\nDr. Rajesh Kumar,BCA SEMESTER I,Programming in C,BCA-101,BCA,A,2024-27,45000";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculty_class_upload_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Upload className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Data Upload</h1>
          <p className="text-gray-500 text-sm">
            Upload student data or faculty class assignments from Excel/CSV
          </p>
        </div>
      </div>

      <Tabs defaultValue="students">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="students">Student Data</TabsTrigger>
          <TabsTrigger value="faculty">Faculty Class Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5" /> Upload Student Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700">
                  Required columns: Student Name, Roll Number, Class, Section,
                  Batch, Course, Enrollment No (optional)
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadStudentTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Template
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Select CSV File</Label>
                <Input
                  ref={studentRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) =>
                    e.target.files?.[0] && handleStudentFile(e.target.files[0])
                  }
                />
              </div>
              {studentError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {studentError}
                </div>
              )}
              {studentPreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {studentPreview.length} students ready to import
                      </span>
                    </div>
                    <Button
                      onClick={importStudents}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Upload className="w-4 h-4 mr-2" /> Import{" "}
                      {studentPreview.length} Students
                    </Button>
                  </div>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Course</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentPreview.map((s) => (
                          <TableRow key={s.rollNumber || s.id}>
                            <TableCell className="font-medium">
                              {s.name}
                            </TableCell>
                            <TableCell>{s.rollNumber}</TableCell>
                            <TableCell>{s.className}</TableCell>
                            <TableCell>{s.section}</TableCell>
                            <TableCell>{s.batch}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{s.course}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSpreadsheet className="w-5 h-5" /> Upload Faculty Class
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700">
                  Required columns: Teacher Name, Class, Subject, Paper Code,
                  Course, Section, Batch, Monthly Limit
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadFacultyTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Template
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Select CSV File</Label>
                <Input
                  ref={facultyRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFacultyFile(e.target.files[0])
                  }
                />
              </div>
              {facultyError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {facultyError}
                </div>
              )}
              {facultyPreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {facultyPreview.length} assignments ready to import
                      </span>
                    </div>
                    <Button
                      onClick={importFaculty}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Upload className="w-4 h-4 mr-2" /> Import{" "}
                      {facultyPreview.length} Assignments
                    </Button>
                  </div>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Paper Code</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Monthly Limit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facultyPreview.map((a) => (
                          <TableRow key={a.paperCode + a.teacherName}>
                            <TableCell className="font-medium">
                              {a.teacherName}
                            </TableCell>
                            <TableCell>{a.className}</TableCell>
                            <TableCell>{a.subjectName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{a.paperCode}</Badge>
                            </TableCell>
                            <TableCell>{a.section}</TableCell>
                            <TableCell>
                              ₹{a.monthlyLimit.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
