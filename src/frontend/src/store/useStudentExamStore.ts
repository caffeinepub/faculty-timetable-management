import { useLocalStorage } from "../hooks/useLocalStorage";
import type { StudentExamMark } from "../types/models";

const SAMPLE_MARKS: StudentExamMark[] = [
  {
    id: "sem-1",
    teacherId: "teacher-1",
    className: "BCA SEMESTER I",
    subjectName: "Programming in C",
    paperCode: "BCA-101",
    examType: "Internal",
    studentId: "stu-1",
    studentName: "Rahul Sharma",
    rollNumber: "BCA24001",
    internalMarks: 17,
    externalMarks: 65,
    totalMarks: 82,
    maxInternal: 20,
    maxExternal: 80,
    submittedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "sem-2",
    teacherId: "teacher-1",
    className: "BCA SEMESTER I",
    subjectName: "Programming in C",
    paperCode: "BCA-101",
    examType: "Internal",
    studentId: "stu-2",
    studentName: "Priya Gupta",
    rollNumber: "BCA24002",
    internalMarks: 19,
    externalMarks: 72,
    totalMarks: 91,
    maxInternal: 20,
    maxExternal: 80,
    submittedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "sem-3",
    teacherId: "teacher-1",
    className: "BCA SEMESTER I",
    subjectName: "Programming in C",
    paperCode: "BCA-101",
    examType: "Internal",
    studentId: "stu-3",
    studentName: "Anil Meena",
    rollNumber: "BCA24003",
    internalMarks: 12,
    externalMarks: 48,
    totalMarks: 60,
    maxInternal: 20,
    maxExternal: 80,
    submittedAt: "2026-01-15T10:00:00Z",
  },
];

function computeGrade(total: number): string {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  return "F";
}

export function useStudentExamStore() {
  const [marks, setMarks] = useLocalStorage<StudentExamMark[]>(
    "ftms-student-exam-marks",
    SAMPLE_MARKS,
  );

  const saveMarks = (
    entries: Omit<StudentExamMark, "id" | "submittedAt" | "totalMarks">[],
  ) => {
    const newMarks: StudentExamMark[] = entries.map((e, i) => ({
      ...e,
      id: `sem-${Date.now()}-${i}`,
      totalMarks: (e.internalMarks ?? 0) + (e.externalMarks ?? 0),
      submittedAt: new Date().toISOString(),
    }));
    const key = (
      m:
        | StudentExamMark
        | Omit<StudentExamMark, "id" | "submittedAt" | "totalMarks">,
    ) =>
      `${(m as StudentExamMark).teacherId || ""}-${m.className}-${m.paperCode}-${m.examType}-${m.studentId}`;
    setMarks((prev) => {
      const filtered = prev.filter(
        (m) => !newMarks.some((nm) => key(nm) === key(m)),
      );
      return [...filtered, ...newMarks];
    });
  };

  const getMarksByClass = (
    className: string,
    paperCode: string,
    examType: string,
  ) =>
    marks.filter(
      (m) =>
        m.className === className &&
        m.paperCode === paperCode &&
        m.examType === examType,
    );

  const getMarksByTeacher = (teacherId: string) =>
    marks.filter((m) => m.teacherId === teacherId);

  const getGrade = computeGrade;

  return { marks, saveMarks, getMarksByClass, getMarksByTeacher, getGrade };
}
