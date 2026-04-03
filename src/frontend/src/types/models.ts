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
  // Extended fields for combined bill entry
  departmentId?: string;
  courseId?: string;
  className?: string;
  subjectName?: string;
  paperCode?: string;
  roomNo?: string;
  startTime?: string; // "8 AM"
  endTime?: string; // "10 AM"
  hoursCalculated?: number;
  remarks?: string;
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

// ---- NEW MODELS ----

export interface LeaveRequest {
  id: string;
  teacherId: string;
  fromDate: string;
  toDate: string;
  type: "Sick" | "Casual" | "Other";
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  adminComment?: string;
  appliedAt: string;
  respondedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  timetableEntryId: string;
  teacherId: string;
  subjectId: string;
  batchId: string;
  date: string;
  attendedCount: number;
  totalCount: number;
  markedBy: string;
  markedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  titleHindi: string;
  description?: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  type: "Holiday" | "Exam" | "Meeting" | "Event" | "Deadline";
  createdBy: string;
}

export interface SystemSettings {
  institutionName: string;
  institutionNameHindi: string;
  logoUrl?: string;
  ratePerHour: number;
  tdsThreshold: number;
  tdsRate: number;
  academicYear: string;
  address?: string;
  phone?: string;
  email?: string;
}

// ---- VERSION 9 MODELS ----

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  semesterId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "10:00"
  endTime: string; // "12:00"
  roomId: string;
  invigilatorIds: string[]; // teacher IDs
  type: "Internal" | "External" | "Practical" | "Viva";
  maxMarks: number;
  status: "Scheduled" | "Ongoing" | "Completed" | "Cancelled";
  createdAt: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentName: string; // manual entry for now
  rollNumber: string;
  marksObtained: number;
  grade: string; // auto-computed: A+/A/B/C/D/F
  remarks?: string;
}

export interface WorkloadEntry {
  teacherId: string;
  subjectId: string;
  weeklyHours: number; // scheduled hours from timetable
  actualHoursThisMonth: number; // from billing
  maxHoursPerMonth: number;
}

export interface SubstituteAssignment {
  id: string;
  leaveRequestId: string;
  originalTeacherId: string;
  substituteTeacherId: string;
  timetableEntryIds: string[]; // which slots are covered
  date: string;
  status: "Assigned" | "Confirmed" | "Cancelled";
  createdAt: string;
  note?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string; // e.g. "Approved Bill #bill-3"
  category:
    | "User"
    | "Billing"
    | "Leave"
    | "Settings"
    | "Faculty"
    | "Exam"
    | "System";
  details?: string;
  timestamp: string;
}

export interface Holiday {
  id: string;
  name: string;
  nameHindi: string;
  date: string; // YYYY-MM-DD
  type: "National" | "State" | "Institute";
  isActive: boolean;
}

export interface Grievance {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  category: "Salary" | "Leave" | "Workload" | "Conduct" | "Facility" | "Other";
  status: "Open" | "Under Review" | "Resolved" | "Rejected";
  priority: "Low" | "Medium" | "High";
  adminResponse?: string;
  submittedAt: string;
  respondedAt?: string;
}

// ---- VERSION 11 MODELS ----

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string; // e.g. "BCA SEMESTER I"
  section: string; // "A", "B"
  batch: string; // "2024-27"
  enrollmentNo: string;
  course: string; // "BCA" | "M.Sc. IT"
}

export interface Course {
  id: string;
  name: string; // "BCA"
  fullName: string; // "Bachelor of Computer Applications"
  duration: number; // years
  totalSemesters: number;
  monthlyClassLimit: number; // 45000 default
  isActive: boolean;
}

export interface CourseAssignment {
  id: string;
  courseId: string;
  className: string;
  subjectName: string;
  paperCode: string;
  teacherId: string;
  teacherName: string;
  monthlyLimit: number; // 45000 default
  section: string;
  batch: string;
  departmentId?: string;
}

export interface StudentAttendanceRecord {
  id: string;
  submissionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
}

export interface StudentAttendanceSubmission {
  id: string;
  teacherId: string;
  className: string;
  subjectName: string;
  paperCode: string;
  month: string; // "2026-01"
  submittedAt: string;
  status: "Submitted" | "Approved" | "Rejected";
  totalStudents: number;
}

export interface StudentExamMark {
  id: string;
  teacherId: string;
  className: string;
  subjectName: string;
  paperCode: string;
  examType: "Internal" | "External" | "Both";
  studentId: string;
  studentName: string;
  rollNumber: string;
  internalMarks?: number; // out of 20
  externalMarks?: number; // out of 80
  totalMarks: number; // out of 100
  maxInternal: number; // 20
  maxExternal: number; // 80
  submittedAt: string;
}

export interface CourseClassEntry {
  id: string;
  teacherId: string;
  courseId: string;
  className: string;
  subjectName: string;
  paperCode: string;
  month: string; // "2026-01"
  classesHeld: number;
  ratePerClass: number;
  grossAmount: number;
  tdsAmount: number;
  netAmount: number;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
}
