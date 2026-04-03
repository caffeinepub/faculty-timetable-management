import { useLocalStorage } from "../hooks/useLocalStorage";
import type { FacultyProfile } from "../types/models";

const SAMPLE_FACULTY: FacultyProfile[] = [
  {
    id: "demo-admin",
    name: "Dr. Rajesh Kumar",
    email: "admin@ftms.edu",
    phone: "9876543210",
    qualifications: "Ph.D. Computer Science, M.Tech",
    role: "admin",
    approvalStatus: "approved",
    department: "Computer Science",
    designation: "Principal",
    monthlyLimit: 100000,
    yearlyLimit: 1200000,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "teacher-1",
    name: "Prof. Anita Sharma",
    email: "anita.sharma@ftms.edu",
    phone: "9876543211",
    qualifications: "M.Sc. IT, B.Ed",
    role: "teacher",
    approvalStatus: "approved",
    department: "Information Technology",
    designation: "Assistant Professor",
    monthlyLimit: 50000,
    yearlyLimit: 600000,
    createdAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "teacher-2",
    name: "Prof. Suresh Patel",
    email: "suresh.patel@ftms.edu",
    phone: "9876543212",
    qualifications: "M.Tech CSE, BCA",
    role: "teacher",
    approvalStatus: "approved",
    department: "Computer Science",
    designation: "Assistant Professor",
    monthlyLimit: 50000,
    yearlyLimit: 600000,
    createdAt: "2024-01-17T10:00:00Z",
  },
  {
    id: "teacher-3",
    name: "Dr. Priya Verma",
    email: "priya.verma@ftms.edu",
    phone: "9876543213",
    qualifications: "Ph.D. Mathematics, M.Sc.",
    role: "teacher",
    approvalStatus: "approved",
    department: "Mathematics",
    designation: "Associate Professor",
    monthlyLimit: 60000,
    yearlyLimit: 720000,
    createdAt: "2024-01-18T10:00:00Z",
  },
  {
    id: "checker-1",
    name: "Mr. Amit Gupta",
    email: "amit.gupta@ftms.edu",
    phone: "9876543214",
    qualifications: "M.Com, CA",
    role: "checker",
    approvalStatus: "approved",
    department: "Finance",
    designation: "Account Checker",
    createdAt: "2024-01-19T10:00:00Z",
  },
  {
    id: "pending-1",
    name: "Ms. Kavita Singh",
    email: "kavita.singh@ftms.edu",
    phone: "9876543215",
    qualifications: "M.Sc. CS",
    role: "teacher",
    approvalStatus: "pending",
    department: "Computer Science",
    designation: "Lecturer",
    createdAt: "2024-02-01T10:00:00Z",
  },
];

export function useFacultyStore() {
  const [faculty, setFaculty] = useLocalStorage<FacultyProfile[]>(
    "ftms_faculty",
    SAMPLE_FACULTY,
  );

  const getFacultyById = (id: string) =>
    faculty.find((f) => f.id === id) ?? null;

  const getApprovedTeachers = () =>
    faculty.filter(
      (f) => f.role === "teacher" && f.approvalStatus === "approved",
    );

  const getPendingFaculty = () =>
    faculty.filter((f) => f.approvalStatus === "pending");

  const addFaculty = (profile: Omit<FacultyProfile, "id" | "createdAt">) => {
    const newProfile: FacultyProfile = {
      ...profile,
      id: `faculty-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    setFaculty((prev) => [...prev, newProfile]);
    return newProfile;
  };

  const updateFaculty = (id: string, updates: Partial<FacultyProfile>) => {
    setFaculty((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  const upsertFacultyById = (id: string, profile: Partial<FacultyProfile>) => {
    setFaculty((prev) => {
      const existing = prev.find((f) => f.id === id);
      if (existing) {
        return prev.map((f) => (f.id === id ? { ...f, ...profile } : f));
      }
      return [
        ...prev,
        {
          id,
          name: profile.name ?? "Unknown",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
          qualifications: profile.qualifications ?? "",
          role: profile.role ?? "teacher",
          approvalStatus: profile.approvalStatus ?? "pending",
          createdAt: new Date().toISOString(),
          ...profile,
        } as FacultyProfile,
      ];
    });
  };

  const setEarningLimits = (
    id: string,
    limits: { monthlyLimit?: number; yearlyLimit?: number },
  ) => {
    updateFaculty(id, limits);
  };

  return {
    faculty,
    getFacultyById,
    getApprovedTeachers,
    getPendingFaculty,
    addFaculty,
    updateFaculty,
    upsertFacultyById,
    setEarningLimits,
  };
}

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
