import { useLocalStorage } from "../hooks/useLocalStorage";
import type { LeaveRequest } from "../types/models";

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const SAMPLE_LEAVES: LeaveRequest[] = [
  {
    id: "leave-1",
    teacherId: "teacher-1",
    fromDate: daysAgo(10),
    toDate: daysAgo(9),
    type: "Sick",
    reason: "High fever and viral infection. Doctor advised two days rest.",
    status: "Approved",
    adminComment: "Approved. Please submit medical certificate.",
    appliedAt: new Date(today.getTime() - 12 * 86400000).toISOString(),
    respondedAt: new Date(today.getTime() - 10 * 86400000).toISOString(),
  },
  {
    id: "leave-2",
    teacherId: "teacher-2",
    fromDate: daysAgo(5),
    toDate: daysAgo(5),
    type: "Casual",
    reason: "Personal family function - sister's engagement ceremony.",
    status: "Approved",
    adminComment: "Approved.",
    appliedAt: new Date(today.getTime() - 7 * 86400000).toISOString(),
    respondedAt: new Date(today.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: "leave-3",
    teacherId: "teacher-3",
    fromDate: daysAgo(3),
    toDate: daysAgo(2),
    type: "Casual",
    reason:
      "Attending academic conference on Advanced Mathematics at IIT Delhi.",
    status: "Pending",
    appliedAt: new Date(today.getTime() - 4 * 86400000).toISOString(),
  },
  {
    id: "leave-4",
    teacherId: "teacher-1",
    fromDate: daysAgo(1),
    toDate: daysAgo(1),
    type: "Other",
    reason: "Emergency family situation requiring immediate attention.",
    status: "Pending",
    appliedAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
  },
];

export function useLeaveStore() {
  const [leaves, setLeaves] = useLocalStorage<LeaveRequest[]>(
    "ftms_leaves",
    SAMPLE_LEAVES,
  );

  const addLeave = (
    leave: Omit<LeaveRequest, "id" | "appliedAt" | "status">,
  ) => {
    const newLeave: LeaveRequest = {
      ...leave,
      id: `leave-${Date.now()}`,
      status: "Pending",
      appliedAt: new Date().toISOString(),
    };
    setLeaves((prev) => [newLeave, ...prev]);
    return newLeave;
  };

  const approveLeave = (id: string, adminComment?: string) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "Approved" as const,
              adminComment,
              respondedAt: new Date().toISOString(),
            }
          : l,
      ),
    );
  };

  const rejectLeave = (id: string, adminComment?: string) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "Rejected" as const,
              adminComment,
              respondedAt: new Date().toISOString(),
            }
          : l,
      ),
    );
  };

  const updateLeave = (id: string, updates: Partial<LeaveRequest>) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    );
  };

  const deleteLeave = (id: string) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
  };

  const getLeavesByTeacher = (teacherId: string) =>
    leaves.filter((l) => l.teacherId === teacherId);

  const getPendingLeaves = () => leaves.filter((l) => l.status === "Pending");

  const getApprovedLeavesCount = (
    teacherId: string,
    type: "Sick" | "Casual" | "Other",
    year: number,
  ) => {
    return leaves.filter(
      (l) =>
        l.teacherId === teacherId &&
        l.type === type &&
        l.status === "Approved" &&
        new Date(l.fromDate).getFullYear() === year,
    ).length;
  };

  return {
    leaves,
    addLeave,
    approveLeave,
    rejectLeave,
    updateLeave,
    deleteLeave,
    getLeavesByTeacher,
    getPendingLeaves,
    getApprovedLeavesCount,
  };
}
