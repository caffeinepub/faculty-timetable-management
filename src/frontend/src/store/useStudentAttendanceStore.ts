import { useLocalStorage } from "../hooks/useLocalStorage";
import type {
  StudentAttendanceRecord,
  StudentAttendanceSubmission,
} from "../types/models";

const SAMPLE_SUBMISSIONS: StudentAttendanceSubmission[] = [
  {
    id: "sas-1",
    teacherId: "teacher-1",
    className: "BCA SEMESTER I",
    subjectName: "Programming in C",
    paperCode: "BCA-101",
    month: "2026-01",
    submittedAt: "2026-01-31T10:00:00Z",
    status: "Submitted",
    totalStudents: 45,
  },
  {
    id: "sas-2",
    teacherId: "teacher-2",
    className: "BCA SEMESTER I",
    subjectName: "Mathematics I",
    paperCode: "BCA-102",
    month: "2026-01",
    submittedAt: "2026-01-31T11:00:00Z",
    status: "Submitted",
    totalStudents: 45,
  },
  {
    id: "sas-3",
    teacherId: "teacher-3",
    className: "M.Sc. IT I SEMESTER",
    subjectName: "Advanced Database",
    paperCode: "MSC-101",
    month: "2025-12",
    submittedAt: "2025-12-31T10:00:00Z",
    status: "Submitted",
    totalStudents: 30,
  },
];

const SAMPLE_RECORDS: StudentAttendanceRecord[] = [
  {
    id: "sar-1",
    submissionId: "sas-1",
    studentId: "stu-1",
    studentName: "Rahul Sharma",
    rollNumber: "BCA24001",
    totalClasses: 22,
    presentCount: 20,
    absentCount: 2,
    leaveCount: 0,
  },
  {
    id: "sar-2",
    submissionId: "sas-1",
    studentId: "stu-2",
    studentName: "Priya Gupta",
    rollNumber: "BCA24002",
    totalClasses: 22,
    presentCount: 18,
    absentCount: 3,
    leaveCount: 1,
  },
  {
    id: "sar-3",
    submissionId: "sas-1",
    studentId: "stu-3",
    studentName: "Anil Meena",
    rollNumber: "BCA24003",
    totalClasses: 22,
    presentCount: 15,
    absentCount: 7,
    leaveCount: 0,
  },
];

export function useStudentAttendanceStore() {
  const [submissions, setSubmissions] = useLocalStorage<
    StudentAttendanceSubmission[]
  >("ftms-student-att-submissions", SAMPLE_SUBMISSIONS);
  const [records, setRecords] = useLocalStorage<StudentAttendanceRecord[]>(
    "ftms-student-att-records",
    SAMPLE_RECORDS,
  );

  const submitAttendance = (
    submission: Omit<
      StudentAttendanceSubmission,
      "id" | "submittedAt" | "status"
    >,
    attendanceData: {
      studentId: string;
      studentName: string;
      rollNumber: string;
      totalClasses: number;
      presentCount: number;
      absentCount: number;
      leaveCount: number;
    }[],
  ) => {
    const sid = `sas-${Date.now()}`;
    const newSub: StudentAttendanceSubmission = {
      ...submission,
      id: sid,
      submittedAt: new Date().toISOString(),
      status: "Submitted",
    };
    setSubmissions((prev) => [
      ...prev.filter(
        (s) =>
          !(
            s.teacherId === submission.teacherId &&
            s.className === submission.className &&
            s.paperCode === submission.paperCode &&
            s.month === submission.month
          ),
      ),
      newSub,
    ]);
    const newRecs: StudentAttendanceRecord[] = attendanceData.map((d, i) => ({
      ...d,
      id: `sar-${Date.now()}-${i}`,
      submissionId: sid,
    }));
    setRecords((prev) => [
      ...prev.filter((r) => r.submissionId !== sid),
      ...newRecs,
    ]);
  };

  const getSubmissionsByTeacher = (teacherId: string) =>
    submissions.filter((s) => s.teacherId === teacherId);

  const getRecordsBySubmission = (submissionId: string) =>
    records.filter((r) => r.submissionId === submissionId);

  const hasSubmitted = (
    teacherId: string,
    className: string,
    paperCode: string,
    month: string,
  ) =>
    submissions.some(
      (s) =>
        s.teacherId === teacherId &&
        s.className === className &&
        s.paperCode === paperCode &&
        s.month === month,
    );

  const getPendingSubmissions = (
    assignedClasses: {
      teacherId: string;
      className: string;
      paperCode: string;
    }[],
    months: string[],
  ) => {
    const pending: {
      teacherId: string;
      className: string;
      paperCode: string;
      month: string;
    }[] = [];
    for (const ac of assignedClasses) {
      for (const month of months) {
        if (!hasSubmitted(ac.teacherId, ac.className, ac.paperCode, month)) {
          pending.push({ ...ac, month });
        }
      }
    }
    return pending;
  };

  return {
    submissions,
    records,
    submitAttendance,
    getSubmissionsByTeacher,
    getRecordsBySubmission,
    hasSubmitted,
    getPendingSubmissions,
  };
}
