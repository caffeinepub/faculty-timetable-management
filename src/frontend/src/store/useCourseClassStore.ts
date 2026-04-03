import { useLocalStorage } from "../hooks/useLocalStorage";
import type { CourseClassEntry } from "../types/models";

const SAMPLE_ENTRIES: CourseClassEntry[] = [
  {
    id: "cce-1",
    teacherId: "teacher-1",
    courseId: "course-1",
    className: "BCA SEMESTER I",
    subjectName: "Programming in C",
    paperCode: "BCA-101",
    month: "2026-01",
    classesHeld: 18,
    ratePerClass: 800,
    grossAmount: 14400,
    tdsAmount: 1440,
    netAmount: 12960,
    status: "Approved",
  },
  {
    id: "cce-2",
    teacherId: "teacher-2",
    courseId: "course-1",
    className: "BCA SEMESTER I",
    subjectName: "Mathematics I",
    paperCode: "BCA-102",
    month: "2026-01",
    classesHeld: 16,
    ratePerClass: 800,
    grossAmount: 12800,
    tdsAmount: 1280,
    netAmount: 11520,
    status: "Submitted",
  },
];

export const MONTHLY_CLASS_LIMIT = 45000;

export function useCourseClassStore() {
  const [entries, setEntries] = useLocalStorage<CourseClassEntry[]>(
    "ftms-course-class-entries",
    SAMPLE_ENTRIES,
  );
  const [limits, setLimits] = useLocalStorage<Record<string, number>>(
    "ftms-course-limits",
    {},
  );

  const getMonthlyLimit = (courseId: string) =>
    limits[courseId] ?? MONTHLY_CLASS_LIMIT;

  const setMonthlyLimit = (courseId: string, limit: number) => {
    setLimits((prev) => ({ ...prev, [courseId]: limit }));
  };

  const getMonthlyTotal = (className: string, month: string) => {
    return entries
      .filter(
        (e) =>
          e.className === className &&
          e.month === month &&
          e.status !== "Rejected",
      )
      .reduce((sum, e) => sum + e.grossAmount, 0);
  };

  const getTeacherMonthlyTotal = (
    teacherId: string,
    className: string,
    month: string,
  ) => {
    return entries
      .filter(
        (e) =>
          e.teacherId === teacherId &&
          e.className === className &&
          e.month === month &&
          e.status !== "Rejected",
      )
      .reduce((sum, e) => sum + e.grossAmount, 0);
  };

  const canAddEntry = (
    className: string,
    month: string,
    amount: number,
    courseId: string,
  ) => {
    const current = getMonthlyTotal(className, month);
    const limit = getMonthlyLimit(courseId);
    return current + amount <= limit;
  };

  const addEntry = (
    entry: Omit<
      CourseClassEntry,
      "id" | "grossAmount" | "tdsAmount" | "netAmount" | "status"
    >,
  ) => {
    const gross = entry.classesHeld * entry.ratePerClass;
    const tds = Math.round(gross * 0.1);
    const net = gross - tds;
    const newEntry: CourseClassEntry = {
      ...entry,
      id: `cce-${Date.now()}`,
      grossAmount: gross,
      tdsAmount: tds,
      netAmount: net,
      status: "Draft",
    };
    setEntries((prev) => [...prev, newEntry]);
    return newEntry;
  };

  const updateStatus = (id: string, status: CourseClassEntry["status"]) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const getEntriesByTeacher = (teacherId: string) =>
    entries.filter((e) => e.teacherId === teacherId);

  return {
    entries,
    getMonthlyLimit,
    setMonthlyLimit,
    getMonthlyTotal,
    getTeacherMonthlyTotal,
    canAddEntry,
    addEntry,
    updateStatus,
    getEntriesByTeacher,
  };
}
