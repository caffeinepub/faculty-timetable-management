// All data models for Faculty & Timetable Management System

export interface FacultyProfile {
  id: string; // principal
  name: string;
  email: string;
  phone: string;
  qualifications: string;
  photoUrl?: string;
  role: "admin" | "teacher" | "checker";
  approvalStatus: "pending" | "approved" | "rejected";
  monthlyLimit?: number;
  yearlyLimit?: number;
  createdAt: string;
  department?: string;
  designation?: string;
}

export interface BankDetails {
  facultyId: string;
  bankName: string;
  branch: string;
  ifscCode: string;
  accountNumber: string; // LOCKED after first save
  mobileNumber: string;
  panNumber: string; // LOCKED after first save
  email: string;
  address: string;
  isLocked: boolean;
  submittedAt: string;
}

export interface Semester {
  id: string;
  name: string; // "BCA Semester I"
  program: string; // "BCA"
  semesterNumber: number;
  isActive: boolean;
}

export interface Subject {
  id: string;
  code: string; // "CS-101"
  name: string;
  type: "Theory" | "Practical";
  semesterId: string;
  creditHours: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: "Classroom" | "Lab";
  isActive: boolean;
}

export interface Batch {
  id: string;
  name: string;
  semesterId: string;
  parentBatchId?: string;
  strength: number;
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface TimetableEntry {
  id: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  batchId: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  weekType: "odd" | "even" | "all";
}

export type BillStatus =
  | "Draft"
  | "Submitted"
  | "Checked"
  | "Approved"
  | "Rejected";

export interface DailyClassBill {
  id: string;
  teacherId: string;
  date: string;
  subjectId: string;
  batchId: string;
  hoursTaught: number;
  ratePerHour: number; // 800
  totalAmount: number;
  status: BillStatus;
  checkerComment?: string;
  adminComment?: string;
  checkedBy?: string;
  approvedBy?: string;
  checkedAt?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string; // English
  titleHindi: string; // Hindi
  body: string; // English
  bodyHindi: string; // Hindi
  senderId: string;
  recipientId?: string; // null/undefined = all teachers
  isGlobal: boolean;
  createdAt: string;
}

export interface NotificationReadStatus {
  notificationId: string;
  userId: string;
  isRead: boolean;
  readAt?: string;
}

export interface TeacherDocument {
  id: string;
  teacherId: string;
  docType: "Qualification" | "IDProof" | "Other";
  blobKey?: string;
  filename: string;
  uploadedAt: string;
  status: "Pending" | "Verified" | "Rejected";
  adminComment?: string;
}

export interface RtgsPayment {
  id: string;
  teacherId: string;
  billIds: string[];
  amount: number;
  tdsAmount: number;
  netAmount: number;
  paymentDate: string;
  referenceNumber: string;
  status: "Pending" | "Processed";
  processedAt?: string;
}
