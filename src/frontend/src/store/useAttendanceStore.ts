import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AttendanceRecord } from "../types/models";

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const SAMPLE_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1",
    timetableEntryId: "tt-1",
    teacherId: "teacher-1",
    subjectId: "sub-1",
    batchId: "batch-1",
    date: daysAgo(1),
    attendedCount: 42,
    totalCount: 48,
    markedBy: "teacher-1",
    markedAt: new Date(today.getTime() - 86400000).toISOString(),
  },
  {
    id: "att-2",
    timetableEntryId: "tt-2",
    teacherId: "teacher-2",
    subjectId: "sub-3",
    batchId: "batch-3",
    date: daysAgo(1),
    attendedCount: 35,
    totalCount: 40,
    markedBy: "teacher-2",
    markedAt: new Date(today.getTime() - 86400000).toISOString(),
  },
  {
    id: "att-3",
    timetableEntryId: "tt-3",
    teacherId: "teacher-3",
    subjectId: "sub-4",
    batchId: "batch-1",
    date: daysAgo(2),
    attendedCount: 30,
    totalCount: 35,
    markedBy: "teacher-3",
    markedAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
  },
  {
    id: "att-4",
    timetableEntryId: "tt-1",
    teacherId: "teacher-1",
    subjectId: "sub-1",
    batchId: "batch-1",
    date: daysAgo(3),
    attendedCount: 45,
    totalCount: 48,
    markedBy: "teacher-1",
    markedAt: new Date(today.getTime() - 3 * 86400000).toISOString(),
  },
  {
    id: "att-5",
    timetableEntryId: "tt-4",
    teacherId: "teacher-2",
    subjectId: "sub-5",
    batchId: "batch-4",
    date: daysAgo(3),
    attendedCount: 28,
    totalCount: 32,
    markedBy: "teacher-2",
    markedAt: new Date(today.getTime() - 3 * 86400000).toISOString(),
  },
  {
    id: "att-6",
    timetableEntryId: "tt-2",
    teacherId: "teacher-2",
    subjectId: "sub-3",
    batchId: "batch-3",
    date: daysAgo(4),
    attendedCount: 38,
    totalCount: 40,
    markedBy: "teacher-2",
    markedAt: new Date(today.getTime() - 4 * 86400000).toISOString(),
  },
];

export function useAttendanceStore() {
  const [records, setRecords] = useLocalStorage<AttendanceRecord[]>(
    "ftms_attendance",
    SAMPLE_ATTENDANCE,
  );

  const markAttendance = (
    record: Omit<AttendanceRecord, "id" | "markedAt">,
  ) => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`,
      markedAt: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const getAttendanceByTeacher = (teacherId: string) =>
    records.filter((r) => r.teacherId === teacherId);

  const getAttendanceByDate = (date: string) =>
    records.filter((r) => r.date === date);

  const getAttendanceStats = (teacherId?: string) => {
    const filtered = teacherId
      ? records.filter((r) => r.teacherId === teacherId)
      : records;
    if (filtered.length === 0)
      return { avgPercent: 0, totalClasses: 0, thisMonth: 0 };
    const totalAttended = filtered.reduce((s, r) => s + r.attendedCount, 0);
    const totalStudents = filtered.reduce((s, r) => s + r.totalCount, 0);
    const avgPercent =
      totalStudents > 0 ? Math.round((totalAttended / totalStudents) * 100) : 0;
    const thisMonth = filtered.filter((r) => {
      const d = new Date(r.date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
    return { avgPercent, totalClasses: filtered.length, thisMonth };
  };

  const getSubjectStats = () => {
    const bySubject: Record<
      string,
      { totalAttended: number; totalStudents: number; count: number }
    > = {};
    for (const r of records) {
      if (!bySubject[r.subjectId]) {
        bySubject[r.subjectId] = {
          totalAttended: 0,
          totalStudents: 0,
          count: 0,
        };
      }
      bySubject[r.subjectId].totalAttended += r.attendedCount;
      bySubject[r.subjectId].totalStudents += r.totalCount;
      bySubject[r.subjectId].count += 1;
    }
    return bySubject;
  };

  return {
    records,
    markAttendance,
    getAttendanceByTeacher,
    getAttendanceByDate,
    getAttendanceStats,
    getSubjectStats,
  };
}
