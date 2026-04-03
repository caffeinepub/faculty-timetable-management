import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Grievance } from "../types/models";

const today = new Date();
const ts = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const SAMPLE_GRIEVANCES: Grievance[] = [
  {
    id: "grievance-1",
    teacherId: "teacher-2",
    teacherName: "Prof. Suresh Patel",
    title: "Incorrect salary calculation for December",
    description:
      "My December salary was calculated incorrectly. The approved bill #bill-9 was not included in the RTGS payment. The shortfall is approximately ₹3,200. Please review and correct the payment.",
    category: "Salary",
    status: "Resolved",
    priority: "High",
    adminResponse:
      "We have reviewed the billing records and confirmed the discrepancy. The payment has been corrected and the remaining ₹3,200 will be included in the next RTGS transfer.",
    submittedAt: ts(15),
    respondedAt: ts(12),
  },
  {
    id: "grievance-2",
    teacherId: "teacher-1",
    teacherName: "Prof. Anita Sharma",
    title: "Leave application rejected without proper reason",
    description:
      "My leave application for March 15-16 was rejected without adequate explanation. I had a valid personal reason and had submitted the application 5 days in advance as per policy.",
    category: "Leave",
    status: "Under Review",
    priority: "Medium",
    submittedAt: ts(5),
  },
  {
    id: "grievance-3",
    teacherId: "teacher-3",
    teacherName: "Dr. Priya Verma",
    title: "Excessive workload beyond sanctioned limit",
    description:
      "I have been assigned 22 weekly hours against the recommended maximum of 20. This is causing significant fatigue and affecting teaching quality. I request immediate rebalancing of the teaching load.",
    category: "Workload",
    status: "Open",
    priority: "High",
    submittedAt: ts(2),
  },
  {
    id: "grievance-4",
    teacherId: "teacher-1",
    teacherName: "Prof. Anita Sharma",
    title: "Computer lab equipment not functional",
    description:
      "10 out of 30 computers in Lab A are non-functional for the past 3 weeks. This is severely impacting the quality of Programming Lab sessions and student learning outcomes.",
    category: "Facility",
    status: "Open",
    priority: "Medium",
    submittedAt: ts(8),
  },
  {
    id: "grievance-5",
    teacherId: "teacher-2",
    teacherName: "Prof. Suresh Patel",
    title: "Request for teaching assistant support",
    description:
      "With 80 students enrolled in CS-201 Data Structures, managing individual doubt sessions is becoming unmanageable. I request a teaching assistant to be assigned for this course.",
    category: "Workload",
    status: "Rejected",
    priority: "Low",
    adminResponse:
      "Teaching assistant allocation is not available for the current semester. Please utilise peer-study groups as an alternative.",
    submittedAt: ts(20),
    respondedAt: ts(17),
  },
];

export function useGrievanceStore() {
  const [grievances, setGrievances] = useLocalStorage<Grievance[]>(
    "ftms_grievances",
    SAMPLE_GRIEVANCES,
  );

  const addGrievance = (
    grievance: Omit<Grievance, "id" | "submittedAt" | "status">,
  ) => {
    const newGrievance: Grievance = {
      ...grievance,
      id: `grievance-${Date.now()}`,
      status: "Open",
      submittedAt: new Date().toISOString(),
    };
    setGrievances((prev) => [newGrievance, ...prev]);
    return newGrievance;
  };

  const updateStatus = (
    id: string,
    status: Grievance["status"],
    adminResponse?: string,
  ) => {
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status,
              adminResponse,
              respondedAt: new Date().toISOString(),
            }
          : g,
      ),
    );
  };

  const getGrievancesByTeacher = (teacherId: string) =>
    grievances.filter((g) => g.teacherId === teacherId);

  const getPendingGrievances = () =>
    grievances.filter(
      (g) => g.status === "Open" || g.status === "Under Review",
    );

  return {
    grievances,
    addGrievance,
    updateStatus,
    getGrievancesByTeacher,
    getPendingGrievances,
  };
}
