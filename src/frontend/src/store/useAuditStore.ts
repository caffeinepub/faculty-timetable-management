import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AuditLog } from "../types/models";

const today = new Date();
const ts = (daysAgo: number, hoursAgo = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
};

const SAMPLE_LOGS: AuditLog[] = [
  {
    id: "audit-1",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Approved Bill #bill-1",
    category: "Billing",
    details: "Amount: ₹1,600 | Teacher: Prof. Anita Sharma",
    timestamp: ts(0, 2),
  },
  {
    id: "audit-2",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Created user Prof. Anita Sharma",
    category: "User",
    details: "Role: Teacher | Department: Information Technology",
    timestamp: ts(1, 3),
  },
  {
    id: "audit-3",
    actorId: "cred_checker",
    actorName: "Mr. Amit Gupta",
    action: "Checked Bill #bill-2",
    category: "Billing",
    details: "Status changed from Submitted to Checked",
    timestamp: ts(1, 5),
  },
  {
    id: "audit-4",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Rejected leave for teacher-2",
    category: "Leave",
    details: "Leave ID: leave-5 | Reason: Insufficient notice period",
    timestamp: ts(2, 1),
  },
  {
    id: "audit-5",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Scheduled exam: Internal Assessment CS-101",
    category: "Exam",
    details: "Date: Upcoming | Room: Room 101 | Invigilators: 2",
    timestamp: ts(2, 4),
  },
  {
    id: "audit-6",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Updated system settings",
    category: "Settings",
    details: "Rate per hour changed to ₹800 | TDS threshold: ₹45,000",
    timestamp: ts(3, 2),
  },
  {
    id: "audit-7",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Approved leave for teacher-1",
    category: "Leave",
    details: "Type: Sick | Duration: 2 days",
    timestamp: ts(4, 0),
  },
  {
    id: "audit-8",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Registered new faculty: Prof. Suresh Patel",
    category: "Faculty",
    details: "Department: Computer Science | Designation: Assistant Professor",
    timestamp: ts(5, 3),
  },
  {
    id: "audit-9",
    actorId: "cred_checker",
    actorName: "Mr. Amit Gupta",
    action: "Rejected Bill #bill-5",
    category: "Billing",
    details: "Reason: Attendance records do not match",
    timestamp: ts(5, 6),
  },
  {
    id: "audit-10",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "System backup initiated",
    category: "System",
    details: "Backup type: Full | Storage: Local",
    timestamp: ts(7, 0),
  },
  {
    id: "audit-11",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Created user Mr. Amit Gupta",
    category: "User",
    details: "Role: Checker | Department: Finance",
    timestamp: ts(8, 2),
  },
  {
    id: "audit-12",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Approved RTGS payment for teacher-1",
    category: "Billing",
    details: "Amount: ₹32,000 | Reference: RTGS20260103001",
    timestamp: ts(9, 1),
  },
  {
    id: "audit-13",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Added holiday: Maha Shivratri",
    category: "System",
    details: "Date: 2026-02-26 | Type: National",
    timestamp: ts(10, 3),
  },
  {
    id: "audit-14",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Updated faculty profile: Dr. Priya Verma",
    category: "Faculty",
    details: "Monthly limit updated to ₹60,000",
    timestamp: ts(12, 0),
  },
  {
    id: "audit-15",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Scheduled exam: Programming Lab Practical",
    category: "Exam",
    details: "Date: Past | Room: Lab A | Type: Practical",
    timestamp: ts(14, 2),
  },
  {
    id: "audit-16",
    actorId: "teacher-1",
    actorName: "Prof. Anita Sharma",
    action: "Submitted bill for CS-101",
    category: "Billing",
    details: "Hours: 2 | Amount: ₹1,600",
    timestamp: ts(3, 5),
  },
  {
    id: "audit-17",
    actorId: "teacher-2",
    actorName: "Prof. Suresh Patel",
    action: "Applied for casual leave",
    category: "Leave",
    details: "Duration: 1 day | Reason: Personal",
    timestamp: ts(7, 3),
  },
  {
    id: "audit-18",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Assigned substitute teacher-1 for teacher-3",
    category: "System",
    details: "Leave: leave-3 | Slots: 1",
    timestamp: ts(4, 4),
  },
  {
    id: "audit-19",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Responded to grievance from Prof. Suresh Patel",
    category: "User",
    details: "Status: Resolved | Category: Salary",
    timestamp: ts(6, 1),
  },
  {
    id: "audit-20",
    actorId: "demo-admin",
    actorName: "Dr. Rajesh Kumar",
    action: "Added academic calendar event: Semester Start",
    category: "System",
    details: "Type: Event | Date: January",
    timestamp: ts(20, 0),
  },
];

export function useAuditStore() {
  const [logs, setLogs] = useLocalStorage<AuditLog[]>(
    "ftms_audit",
    SAMPLE_LOGS,
  );

  const addLog = (log: Omit<AuditLog, "id" | "timestamp">) => {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    return newLog;
  };

  const getLogsByCategory = (category: AuditLog["category"]) =>
    logs.filter((l) => l.category === category);

  const getLogsByActor = (actorId: string) =>
    logs.filter((l) => l.actorId === actorId);

  const clearOldLogs = (daysOld: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    setLogs((prev) => prev.filter((l) => new Date(l.timestamp) > cutoff));
  };

  return { logs, addLog, getLogsByCategory, getLogsByActor, clearOldLogs };
}
