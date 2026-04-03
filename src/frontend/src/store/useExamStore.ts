import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Exam, ExamResult } from "../types/models";

const today = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};
const daysAgo = (n: number) => daysFromNow(-n);

const SAMPLE_EXAMS: Exam[] = [
  {
    id: "exam-1",
    title: "Internal Assessment - CS-101",
    subjectId: "sub-1",
    semesterId: "sem-1",
    date: daysAgo(5),
    startTime: "10:00",
    endTime: "12:00",
    roomId: "room-1",
    invigilatorIds: ["teacher-1", "teacher-3"],
    type: "Internal",
    maxMarks: 30,
    status: "Completed",
    createdAt: new Date(today.getTime() - 15 * 86400000).toISOString(),
  },
  {
    id: "exam-2",
    title: "Mid-Term Exam - Data Structures",
    subjectId: "sub-3",
    semesterId: "sem-2",
    date: daysFromNow(3),
    startTime: "09:00",
    endTime: "12:00",
    roomId: "room-2",
    invigilatorIds: ["teacher-2"],
    type: "Internal",
    maxMarks: 50,
    status: "Scheduled",
    createdAt: new Date(today.getTime() - 10 * 86400000).toISOString(),
  },
  {
    id: "exam-3",
    title: "Programming Lab - Practical",
    subjectId: "sub-2",
    semesterId: "sem-1",
    date: daysAgo(2),
    startTime: "14:00",
    endTime: "17:00",
    roomId: "room-3",
    invigilatorIds: ["teacher-1"],
    type: "Practical",
    maxMarks: 50,
    status: "Completed",
    createdAt: new Date(today.getTime() - 12 * 86400000).toISOString(),
  },
  {
    id: "exam-4",
    title: "Advanced Algorithms - Viva Voce",
    subjectId: "sub-5",
    semesterId: "sem-3",
    date: daysFromNow(7),
    startTime: "11:00",
    endTime: "13:00",
    roomId: "room-1",
    invigilatorIds: ["teacher-2", "teacher-3"],
    type: "Viva",
    maxMarks: 25,
    status: "Scheduled",
    createdAt: new Date(today.getTime() - 8 * 86400000).toISOString(),
  },
  {
    id: "exam-5",
    title: "Mathematics I - End Semester",
    subjectId: "sub-4",
    semesterId: "sem-1",
    date: daysFromNow(14),
    startTime: "10:00",
    endTime: "13:00",
    roomId: "room-2",
    invigilatorIds: ["teacher-3"],
    type: "External",
    maxMarks: 100,
    status: "Scheduled",
    createdAt: new Date(today.getTime() - 5 * 86400000).toISOString(),
  },
];

const SAMPLE_RESULTS: ExamResult[] = [
  {
    id: "res-1",
    examId: "exam-1",
    studentName: "Aarav Mehta",
    rollNumber: "BCA/24/001",
    marksObtained: 27,
    grade: "A+",
    remarks: "Excellent",
  },
  {
    id: "res-2",
    examId: "exam-1",
    studentName: "Priya Joshi",
    rollNumber: "BCA/24/002",
    marksObtained: 24,
    grade: "A",
    remarks: "Good",
  },
  {
    id: "res-3",
    examId: "exam-1",
    studentName: "Rahul Sharma",
    rollNumber: "BCA/24/003",
    marksObtained: 20,
    grade: "B",
    remarks: "Average",
  },
  {
    id: "res-4",
    examId: "exam-1",
    studentName: "Sneha Gupta",
    rollNumber: "BCA/24/004",
    marksObtained: 18,
    grade: "C",
    remarks: "",
  },
  {
    id: "res-5",
    examId: "exam-1",
    studentName: "Vikram Singh",
    rollNumber: "BCA/24/005",
    marksObtained: 15,
    grade: "D",
    remarks: "Needs improvement",
  },
  {
    id: "res-6",
    examId: "exam-3",
    studentName: "Aarav Mehta",
    rollNumber: "BCA/24/001",
    marksObtained: 45,
    grade: "A+",
    remarks: "Outstanding practical",
  },
  {
    id: "res-7",
    examId: "exam-3",
    studentName: "Priya Joshi",
    rollNumber: "BCA/24/002",
    marksObtained: 40,
    grade: "A",
    remarks: "",
  },
  {
    id: "res-8",
    examId: "exam-3",
    studentName: "Rahul Sharma",
    rollNumber: "BCA/24/003",
    marksObtained: 35,
    grade: "B",
    remarks: "",
  },
];

export function computeGrade(marks: number, maxMarks: number): string {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

export function useExamStore() {
  const [exams, setExams] = useLocalStorage<Exam[]>("ftms_exams", SAMPLE_EXAMS);
  const [results, setResults] = useLocalStorage<ExamResult[]>(
    "ftms_results",
    SAMPLE_RESULTS,
  );

  const addExam = (exam: Omit<Exam, "id" | "createdAt">) => {
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExams((prev) => [newExam, ...prev]);
    return newExam;
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    setResults((prev) => prev.filter((r) => r.examId !== id));
  };

  const addResult = (result: Omit<ExamResult, "id" | "grade">) => {
    const exam = exams.find((e) => e.id === result.examId);
    const grade = exam
      ? computeGrade(result.marksObtained, exam.maxMarks)
      : "F";
    const newResult: ExamResult = { ...result, id: `res-${Date.now()}`, grade };
    setResults((prev) => [...prev, newResult]);
    return newResult;
  };

  const updateResult = (id: string, updates: Partial<ExamResult>) => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        if (updates.marksObtained !== undefined) {
          const exam = exams.find((e) => e.id === r.examId);
          if (exam)
            updated.grade = computeGrade(updates.marksObtained, exam.maxMarks);
        }
        return updated;
      }),
    );
  };

  const deleteResult = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const getExamsBySubject = (subjectId: string) =>
    exams.filter((e) => e.subjectId === subjectId);

  const getExamsByInvigilator = (teacherId: string) =>
    exams.filter((e) => e.invigilatorIds.includes(teacherId));

  const getResultsByExam = (examId: string) =>
    results.filter((r) => r.examId === examId);

  return {
    exams,
    results,
    addExam,
    updateExam,
    deleteExam,
    addResult,
    updateResult,
    deleteResult,
    getExamsBySubject,
    getExamsByInvigilator,
    getResultsByExam,
  };
}
