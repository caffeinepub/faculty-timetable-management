import { useLocalStorage } from "../hooks/useLocalStorage";
import type { FacultyProfile, WorkloadEntry } from "../types/models";

const SAMPLE_WORKLOAD: WorkloadEntry[] = [
  {
    teacherId: "teacher-1",
    subjectId: "sub-1",
    weeklyHours: 18,
    actualHoursThisMonth: 62,
    maxHoursPerMonth: 80,
  },
  {
    teacherId: "teacher-1",
    subjectId: "sub-2",
    weeklyHours: 6,
    actualHoursThisMonth: 18,
    maxHoursPerMonth: 80,
  },
  {
    teacherId: "teacher-2",
    subjectId: "sub-3",
    weeklyHours: 12,
    actualHoursThisMonth: 44,
    maxHoursPerMonth: 80,
  },
  {
    teacherId: "teacher-2",
    subjectId: "sub-5",
    weeklyHours: 14,
    actualHoursThisMonth: 52,
    maxHoursPerMonth: 80,
  },
  {
    teacherId: "teacher-3",
    subjectId: "sub-4",
    weeklyHours: 22,
    actualHoursThisMonth: 88,
    maxHoursPerMonth: 80,
  },
  {
    teacherId: "teacher-3",
    subjectId: "sub-6",
    weeklyHours: 6,
    actualHoursThisMonth: 20,
    maxHoursPerMonth: 80,
  },
];

export function useWorkloadStore() {
  const [entries, setEntries] = useLocalStorage<WorkloadEntry[]>(
    "ftms_workload",
    SAMPLE_WORKLOAD,
  );

  const setEntry = (entry: WorkloadEntry) => {
    setEntries((prev) => {
      const exists = prev.findIndex(
        (e) =>
          e.teacherId === entry.teacherId && e.subjectId === entry.subjectId,
      );
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = entry;
        return next;
      }
      return [...prev, entry];
    });
  };

  const getEntriesForTeacher = (teacherId: string) =>
    entries.filter((e) => e.teacherId === teacherId);

  const getOverloadedTeachers = (
    faculty: FacultyProfile[],
    ents: WorkloadEntry[],
  ) => {
    const grouped: Record<string, WorkloadEntry[]> = {};
    for (const e of ents) {
      if (!grouped[e.teacherId]) grouped[e.teacherId] = [];
      grouped[e.teacherId].push(e);
    }
    return faculty.filter((f) => {
      const teacherEntries = grouped[f.id] ?? [];
      const totalWeekly = teacherEntries.reduce((s, e) => s + e.weeklyHours, 0);
      const totalActual = teacherEntries.reduce(
        (s, e) => s + e.actualHoursThisMonth,
        0,
      );
      const maxHours = teacherEntries[0]?.maxHoursPerMonth ?? 80;
      return totalWeekly > 20 || totalActual > maxHours * 0.9;
    });
  };

  return { entries, setEntry, getEntriesForTeacher, getOverloadedTeachers };
}
