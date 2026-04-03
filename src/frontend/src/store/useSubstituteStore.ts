import { useLocalStorage } from "../hooks/useLocalStorage";
import type { SubstituteAssignment } from "../types/models";

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const SAMPLE_ASSIGNMENTS: SubstituteAssignment[] = [
  {
    id: "sub-assign-1",
    leaveRequestId: "leave-1",
    originalTeacherId: "teacher-1",
    substituteTeacherId: "teacher-2",
    timetableEntryIds: ["entry-1", "entry-7"],
    date: daysAgo(10),
    status: "Confirmed",
    createdAt: new Date(today.getTime() - 11 * 86400000).toISOString(),
    note: "Please cover CS-101 lecture for both slots.",
  },
  {
    id: "sub-assign-2",
    leaveRequestId: "leave-2",
    originalTeacherId: "teacher-2",
    substituteTeacherId: "teacher-3",
    timetableEntryIds: ["entry-4"],
    date: daysAgo(5),
    status: "Confirmed",
    createdAt: new Date(today.getTime() - 6 * 86400000).toISOString(),
    note: "Cover Data Structures lecture.",
  },
  {
    id: "sub-assign-3",
    leaveRequestId: "leave-3",
    originalTeacherId: "teacher-3",
    substituteTeacherId: "teacher-1",
    timetableEntryIds: ["entry-6"],
    date: daysAgo(3),
    status: "Assigned",
    createdAt: new Date(today.getTime() - 4 * 86400000).toISOString(),
  },
];

export function useSubstituteStore() {
  const [assignments, setAssignments] = useLocalStorage<SubstituteAssignment[]>(
    "ftms_substitutes",
    SAMPLE_ASSIGNMENTS,
  );

  const addAssignment = (
    assignment: Omit<SubstituteAssignment, "id" | "createdAt">,
  ) => {
    const newAssignment: SubstituteAssignment = {
      ...assignment,
      id: `sub-assign-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    return newAssignment;
  };

  const updateStatus = (id: string, status: SubstituteAssignment["status"]) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  };

  const updateAssignment = (
    id: string,
    updates: Partial<SubstituteAssignment>,
  ) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const getAssignmentsForLeave = (leaveRequestId: string) =>
    assignments.filter((a) => a.leaveRequestId === leaveRequestId);

  const getAssignmentsForTeacher = (teacherId: string) =>
    assignments.filter(
      (a) =>
        a.originalTeacherId === teacherId ||
        a.substituteTeacherId === teacherId,
    );

  return {
    assignments,
    addAssignment,
    updateStatus,
    updateAssignment,
    deleteAssignment,
    getAssignmentsForLeave,
    getAssignmentsForTeacher,
  };
}
