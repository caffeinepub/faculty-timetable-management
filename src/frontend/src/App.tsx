import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity as ActivityIcon,
  BarChart2 as BarChart2Icon,
  BarChart as BarChartIcon,
  Bell as BellIcon,
  BookOpenCheck as BookOpenCheckIcon,
  BookOpen as BookOpenIcon,
  Building2 as BuildingIcon,
  CalendarDays as CalendarDaysIcon,
  Calendar as CalendarIcon,
  CalendarOff as CalendarOffIcon,
  CalendarRange as CalendarRangeIcon,
  CheckSquare as CheckSquareIcon,
  ClipboardCheck as ClipboardCheckIcon,
  ClipboardList as ClipboardListIcon,
  CreditCard as CreditCardIcon,
  DollarSign as DollarSignIcon,
  FileText as FileTextIcon,
  GraduationCap as GraduationCapIcon,
  Layers as LayersIcon,
  LayoutDashboard as LayoutDashboardIcon,
  LogOut as LogOutIcon,
  Megaphone as MegaphoneIcon,
  Menu as MenuIcon,
  MessageSquare as MessageSquareIcon,
  Newspaper as NewspaperIcon,
  Receipt as ReceiptIcon,
  RefreshCw as RefreshCwIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Umbrella as UmbrellaIcon,
  Upload as UploadIcon,
  UserCheck as UserCheckIcon,
  UserCog as UserCogIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon,
  X as XIcon,
} from "lucide-react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UserRole } from "./backend";
import type { UserProfile } from "./backend.d";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NotificationPopup } from "./components/NotificationPopup";
import { useActor } from "./hooks/useActor";
import type { CredentialSession } from "./hooks/useCredentialAuth";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PendingApprovalPage } from "./pages/PendingApprovalPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { AcademicCalendar } from "./pages/admin/AcademicCalendar";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AttendanceStatusAdmin } from "./pages/admin/AttendanceStatusAdmin";
import { AttendanceTracker } from "./pages/admin/AttendanceTracker";
import { AuditLog } from "./pages/admin/AuditLog";
import { BillingOversight } from "./pages/admin/BillingOversight";
import { BulkUpload } from "./pages/admin/BulkUpload";
import { CourseManagement } from "./pages/admin/CourseManagement";
import { Departments } from "./pages/admin/Departments";
import { ExamManagement } from "./pages/admin/ExamManagement";
import { FacultyDetail } from "./pages/admin/FacultyDetail";
import { FacultyManagement } from "./pages/admin/FacultyManagement";
import { FacultyRegister } from "./pages/admin/FacultyRegister";
import { FeeManagement } from "./pages/admin/FeeManagement";
import { HolidayManager } from "./pages/admin/HolidayManager";
import { LeaveManagement } from "./pages/admin/LeaveManagement";
import { NoticeBoardManager } from "./pages/admin/NoticeBoardManager";
import { NotificationComposer } from "./pages/admin/NotificationComposer";
import { PerformanceReview } from "./pages/admin/PerformanceReview";
import { ReportsAnalytics } from "./pages/admin/ReportsAnalytics";
import { RtgsPayments } from "./pages/admin/RtgsPayments";
import { SalarySlips } from "./pages/admin/SalarySlips";
import { StudentManagement } from "./pages/admin/StudentManagement";
import { SubstituteManager } from "./pages/admin/SubstituteManager";
import { SystemSettings } from "./pages/admin/SystemSettings";
import { TimetableBuilder } from "./pages/admin/TimetableBuilder";
import { UserManagement } from "./pages/admin/UserManagement";
import { WorkloadPlanner } from "./pages/admin/WorkloadPlanner";
import { ApprovedBills } from "./pages/checker/ApprovedBills";
import { BillReview } from "./pages/checker/BillReview";
import { BulkBillProcessing } from "./pages/checker/BulkBillProcessing";
import { CheckerDashboard } from "./pages/checker/CheckerDashboard";
import { CheckerStats } from "./pages/checker/CheckerStats";
import { AnnouncementBoard } from "./pages/teacher/AnnouncementBoard";
import { BankRegistration } from "./pages/teacher/BankRegistration";
import { Documents } from "./pages/teacher/Documents";
import { EarningsHistory } from "./pages/teacher/EarningsHistory";
import { ExamMarksPage } from "./pages/teacher/ExamMarksPage";
import { ExamScheduleTeacher } from "./pages/teacher/ExamScheduleTeacher";
import { FacultyBillEntry } from "./pages/teacher/FacultyBillEntry";
import { FacultyInvoice } from "./pages/teacher/FacultyInvoice";
import { GrievancePortal } from "./pages/teacher/GrievancePortal";
import { LeaveApplication } from "./pages/teacher/LeaveApplication";
import { MyTimetable } from "./pages/teacher/MyTimetable";
import { NoticeBoardTeacher } from "./pages/teacher/NoticeBoardTeacher";
import { PerformanceDashboard } from "./pages/teacher/PerformanceDashboard";
import { Profile } from "./pages/teacher/Profile";
import { SalarySlipTeacher } from "./pages/teacher/SalarySlipTeacher";
import { StudentAttendancePage } from "./pages/teacher/StudentAttendancePage";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { TeachingPlan } from "./pages/teacher/TeachingPlan";
import { useBillingStore } from "./store/useBillingStore";
import { useFacultyStore } from "./store/useFacultyStore";
import { useNotificationStore } from "./store/useNotificationStore";
import { useTimetableStore } from "./store/useTimetableStore";
import type { AppNotification, FacultyProfile } from "./types/models";

// ============ NAVIGATION CONTEXT ============
interface NavContextType {
  navigate: (path: string) => void;
  currentPath: string;
}

const NavigationContext = createContext<NavContextType>({
  navigate: () => {},
  currentPath: "/",
});

export function useNavigation() {
  return useContext(NavigationContext);
}

// ============ NAV ITEMS ============
const ADMIN_NAV_ITEMS = [
  {
    icon: <LayoutDashboardIcon className="w-4 h-4" />,
    label: "Dashboard",
    href: "/admin",
  },
  {
    icon: <CalendarIcon className="w-4 h-4" />,
    label: "Timetables",
    href: "/admin/timetable",
  },
  {
    icon: <UsersIcon className="w-4 h-4" />,
    label: "Faculty",
    href: "/admin/faculty",
  },
  {
    icon: <UserPlusIcon className="w-4 h-4" />,
    label: "Register Faculty",
    href: "/admin/faculty/register",
  },
  {
    icon: <FileTextIcon className="w-4 h-4" />,
    label: "Billing",
    href: "/admin/billing",
  },
  {
    icon: <CreditCardIcon className="w-4 h-4" />,
    label: "RTGS Payments",
    href: "/admin/rtgs",
  },
  {
    icon: <BellIcon className="w-4 h-4" />,
    label: "Notifications",
    href: "/admin/notifications",
  },
  {
    icon: <UserCogIcon className="w-4 h-4" />,
    label: "User Management",
    href: "/admin/users",
  },
  {
    icon: <BarChart2Icon className="w-4 h-4" />,
    label: "Reports",
    href: "/admin/reports",
  },
  {
    icon: <UserCheckIcon className="w-4 h-4" />,
    label: "Attendance",
    href: "/admin/attendance",
  },
  {
    icon: <CalendarDaysIcon className="w-4 h-4" />,
    label: "Leave Mgmt",
    href: "/admin/leaves",
  },
  {
    icon: <CalendarRangeIcon className="w-4 h-4" />,
    label: "Calendar",
    href: "/admin/calendar",
  },
  {
    icon: <BuildingIcon className="w-4 h-4" />,
    label: "Departments",
    href: "/admin/departments",
  },
  {
    icon: <ReceiptIcon className="w-4 h-4" />,
    label: "Salary Slips",
    href: "/admin/salary",
  },
  {
    icon: <NewspaperIcon className="w-4 h-4" />,
    label: "Notice Board",
    href: "/admin/noticeboard",
  },
  {
    icon: <SettingsIcon className="w-4 h-4" />,
    label: "Settings",
    href: "/admin/settings",
  },
  {
    icon: <GraduationCapIcon className="w-4 h-4" />,
    label: "Exams",
    href: "/admin/exams",
  },
  {
    icon: <ActivityIcon className="w-4 h-4" />,
    label: "Workload",
    href: "/admin/workload",
  },
  {
    icon: <RefreshCwIcon className="w-4 h-4" />,
    label: "Substitutes",
    href: "/admin/substitutes",
  },
  {
    icon: <ClipboardListIcon className="w-4 h-4" />,
    label: "Audit Log",
    href: "/admin/audit",
  },
  {
    icon: <UmbrellaIcon className="w-4 h-4" />,
    label: "Holidays",
    href: "/admin/holidays",
  },
  {
    icon: <UploadIcon className="w-4 h-4" />,
    label: "Bulk Upload",
    href: "/admin/bulk-upload",
  },
  {
    icon: <BookOpenIcon className="w-4 h-4" />,
    label: "Courses",
    href: "/admin/courses",
  },
  {
    icon: <UsersIcon className="w-4 h-4" />,
    label: "Students",
    href: "/admin/students",
  },
  {
    icon: <ClipboardCheckIcon className="w-4 h-4" />,
    label: "Att. Status",
    href: "/admin/attendance-status",
  },
  {
    icon: <StarIcon className="w-4 h-4" />,
    label: "Performance",
    href: "/admin/performance",
  },
  {
    icon: <DollarSignIcon className="w-4 h-4" />,
    label: "Fee Management",
    href: "/admin/fees",
  },
  {
    icon: <FileTextIcon className="w-4 h-4" />,
    label: "Invoice",
    href: "/admin/invoice",
  },
];

const TEACHER_NAV_ITEMS = [
  {
    icon: <LayoutDashboardIcon className="w-4 h-4" />,
    label: "Dashboard",
    href: "/teacher",
  },
  {
    icon: <CalendarIcon className="w-4 h-4" />,
    label: "Timetable",
    href: "/teacher/timetable",
  },
  {
    icon: <FileTextIcon className="w-4 h-4" />,
    label: "Bill Entry",
    href: "/teacher/bill-entry",
  },
  {
    icon: <CreditCardIcon className="w-4 h-4" />,
    label: "Bank Registration",
    href: "/teacher/bank",
  },
  {
    icon: <UploadIcon className="w-4 h-4" />,
    label: "Documents",
    href: "/teacher/documents",
  },
  {
    icon: <UserCogIcon className="w-4 h-4" />,
    label: "Profile",
    href: "/teacher/profile",
  },
  {
    icon: <TrendingUpIcon className="w-4 h-4" />,
    label: "Earnings",
    href: "/teacher/earnings",
  },
  {
    icon: <MegaphoneIcon className="w-4 h-4" />,
    label: "Announcements",
    href: "/teacher/announcements",
  },
  {
    icon: <CalendarOffIcon className="w-4 h-4" />,
    label: "Leave",
    href: "/teacher/leave",
  },
  {
    icon: <ReceiptIcon className="w-4 h-4" />,
    label: "Salary Slips",
    href: "/teacher/salary",
  },
  {
    icon: <NewspaperIcon className="w-4 h-4" />,
    label: "Notice Board",
    href: "/teacher/noticeboard",
  },
  {
    icon: <BookOpenCheckIcon className="w-4 h-4" />,
    label: "Teaching Plan",
    href: "/teacher/teaching-plan",
  },
  {
    icon: <GraduationCapIcon className="w-4 h-4" />,
    label: "Exam Schedule",
    href: "/teacher/exams",
  },
  {
    icon: <MessageSquareIcon className="w-4 h-4" />,
    label: "Grievance",
    href: "/teacher/grievance",
  },
  {
    icon: <ClipboardListIcon className="w-4 h-4" />,
    label: "Attendance",
    href: "/teacher/student-attendance",
  },
  {
    icon: <BookOpenCheckIcon className="w-4 h-4" />,
    label: "Exam Marks",
    href: "/teacher/exam-marks",
  },
  {
    icon: <TrendingUpIcon className="w-4 h-4" />,
    label: "Performance",
    href: "/teacher/performance",
  },
  {
    icon: <ReceiptIcon className="w-4 h-4" />,
    label: "Invoice",
    href: "/teacher/invoice",
  },
];

const CHECKER_NAV_ITEMS = [
  {
    icon: <LayoutDashboardIcon className="w-4 h-4" />,
    label: "Dashboard",
    href: "/checker",
  },
  {
    icon: <ClipboardCheckIcon className="w-4 h-4" />,
    label: "Bill Review",
    href: "/checker/bills",
  },
  {
    icon: <CheckSquareIcon className="w-4 h-4" />,
    label: "Approved",
    href: "/checker/approved",
  },
  {
    icon: <BarChartIcon className="w-4 h-4" />,
    label: "My Stats",
    href: "/checker/stats",
  },
  {
    icon: <LayersIcon className="w-4 h-4" />,
    label: "Bulk Process",
    href: "/checker/bulk",
  },
];

// ============ PAGE TITLES ============
const PAGE_TITLES: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/faculty": "Faculty Management",
  "/admin/faculty/register": "Register Faculty",
  "/admin/timetable": "Timetable Builder",
  "/admin/billing": "Billing Oversight",
  "/admin/notifications": "Notifications",
  "/admin/rtgs": "RTGS Payments",
  "/admin/users": "User Management",
  "/admin/reports": "Reports & Analytics",
  "/admin/attendance": "Attendance Tracker",
  "/admin/leaves": "Leave Management",
  "/admin/calendar": "Academic Calendar",
  "/admin/settings": "System Settings",
  "/admin/departments": "Departments",
  "/admin/salary": "Salary Slips",
  "/admin/noticeboard": "Notice Board",
  "/teacher": "Teacher Dashboard",
  "/teacher/timetable": "My Timetable",
  "/teacher/bill-entry": "Bill Entry",
  "/teacher/bank": "Bank Registration",
  "/teacher/documents": "Documents",
  "/teacher/profile": "My Profile",
  "/teacher/earnings": "Earnings History",
  "/teacher/announcements": "Announcements",
  "/teacher/leave": "Leave Application",
  "/teacher/salary": "Salary Slips",
  "/teacher/noticeboard": "Notice Board",
  "/teacher/teaching-plan": "Teaching Plan Generator",
  "/checker": "Checker Dashboard",
  "/checker/bills": "Bill Review",
  "/checker/approved": "Approved Bills",
  "/checker/stats": "My Statistics",
  "/admin/exams": "Exam Management",
  "/admin/workload": "Workload Planner",
  "/admin/substitutes": "Substitute Manager",
  "/admin/audit": "Audit Log",
  "/admin/holidays": "Holiday Manager",
  "/admin/bulk-upload": "Bulk Data Upload",
  "/admin/courses": "Course Management",
  "/admin/students": "Student Management",
  "/admin/attendance-status": "Attendance Status",
  "/teacher/student-attendance": "Student Attendance",
  "/teacher/exam-marks": "Student Exam Marks",
  "/teacher/exams": "Exam Schedule",
  "/teacher/grievance": "Grievance Portal",
  "/checker/bulk": "Bulk Bill Processing",
  "/admin/performance": "Performance Review",
  "/admin/fees": "Fee Management",
  "/teacher/performance": "Performance Dashboard",
  "/admin/invoice": "Faculty Invoice",
  "/teacher/invoice": "My Invoice",
};

// ============ BREADCRUMB HELPER ============
function getBreadcrumbs(path: string): { label: string; href?: string }[] {
  const segments = path.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];

  if (segments.length === 0) return [{ label: "Home" }];

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    teacher: "Teacher",
    checker: "Checker",
  };

  const roleSegmentLabels: Record<string, string> = {
    faculty: "Faculty",
    timetable: "Timetable",
    billing: "Billing",
    rtgs: "RTGS Payments",
    notifications: "Notifications",
    users: "Users",
    reports: "Reports",
    attendance: "Attendance",
    leaves: "Leaves",
    calendar: "Calendar",
    settings: "Settings",
    departments: "Departments",
    salary: "Salary",
    noticeboard: "Notice Board",
    bills: "Bills",
    bank: "Bank",
    documents: "Documents",
    profile: "Profile",
    earnings: "Earnings",
    announcements: "Announcements",
    leave: "Leave",
    approved: "Approved",
    stats: "Stats",
    register: "Register",
    "teaching-plan": "Teaching Plan",
    exams: "Exams",
    workload: "Workload",
    substitutes: "Substitutes",
    audit: "Audit Log",
    holidays: "Holidays",
    grievance: "Grievance",
    "bulk-upload": "Bulk Upload",
    courses: "Courses",
    students: "Students",
    "attendance-status": "Att. Status",
    "student-attendance": "Attendance",
    "exam-marks": "Exam Marks",
    "bill-entry": "Bill Entry",
    bulk: "Bulk Process",
  };

  if (segments[0] in roleLabels) {
    crumbs.push({ label: roleLabels[segments[0]], href: `/${segments[0]}` });
    if (segments[1]) {
      if (
        segments[1] === "faculty" &&
        segments[2] &&
        segments[2] !== "register"
      ) {
        crumbs.push({ label: "Faculty", href: "/admin/faculty" });
        crumbs.push({ label: "Detail" });
      } else {
        const sub = roleSegmentLabels[segments[1]] ?? segments[1];
        const href = `/${segments[0]}/${segments[1]}`;
        if (segments[2]) {
          crumbs.push({ label: sub, href });
          crumbs.push({ label: roleSegmentLabels[segments[2]] ?? segments[2] });
        } else {
          crumbs.push({ label: sub });
        }
      }
    }
  }

  return crumbs;
}

// ============ GLOBAL SEARCH ============
interface SearchResult {
  label: string;
  subtitle: string;
  href: string;
}

function GlobalSearch({ navigate }: { navigate: (p: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { faculty } = useFacultyStore();
  const { bills } = useBillingStore();
  const { subjects } = useTimetableStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const res: SearchResult[] = [];

    // Faculty names
    for (const f of faculty) {
      if (
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
      ) {
        res.push({
          label: f.name,
          subtitle: `${f.role} \u2022 ${f.department ?? ""}`,
          href:
            f.role === "teacher" ? `/admin/faculty/${f.id}` : "/admin/faculty",
        });
      }
    }

    // Bills
    for (const b of bills) {
      if (b.id.includes(q) || String(b.totalAmount).includes(q)) {
        const teacher = faculty.find((f) => f.id === b.teacherId);
        res.push({
          label: `Bill #${b.id} \u2014 \u20b9${b.totalAmount}`,
          subtitle: `${b.status} \u2022 ${teacher?.name ?? b.teacherId}`,
          href: "/admin/billing",
        });
      }
    }

    // Subjects
    for (const s of subjects) {
      if (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      ) {
        res.push({
          label: s.name,
          subtitle: `Subject \u2022 ${s.code}`,
          href: "/admin/timetable",
        });
      }
    }

    return res.slice(0, 6);
  }, [query, faculty, bills, subjects]);

  useEffect(() => {
    if (results.length > 0) setOpen(true);
    else setOpen(false);
  }, [results]);

  return (
    <div className="relative">
      <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 w-52">
        <SearchIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="bg-transparent text-sm placeholder:text-muted-foreground outline-none flex-1 w-full"
          data-ocid="header.search_input"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <XIcon className="w-3 h-3" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={`${r.href}-${i}`}
              type="button"
              className="w-full text-left px-3 py-2.5 hover:bg-secondary transition-colors border-b border-border last:border-0"
              onClick={() => {
                navigate(r.href);
                setQuery("");
                setOpen(false);
              }}
            >
              <div className="text-sm font-medium truncate">{r.label}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {r.subtitle}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ APP LAYOUT ============
interface AppLayoutProps {
  role: "admin" | "teacher" | "checker";
  currentProfile: FacultyProfile | null;
  userId: string | null;
  onLogout: () => void;
  pageTitle: string;
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

function AppLayout({
  role,
  currentProfile,
  onLogout,
  pageTitle,
  currentPath,
  navigate,
  children,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { getUnreadCount } = useNotificationStore();
  const principalId = currentProfile?.id ?? "";

  const unreadCount = getUnreadCount(principalId);

  const navItems =
    role === "admin"
      ? ADMIN_NAV_ITEMS
      : role === "teacher"
        ? TEACHER_NAV_ITEMS
        : CHECKER_NAV_ITEMS;

  const roleLabel =
    role === "admin" ? "Admin" : role === "teacher" ? "Teacher" : "Checker";
  const roleLabelHindi =
    role === "admin" ? "प्रशासक" : role === "teacher" ? "शिक्षक" : "जांचकर्ता";
  const initials =
    currentProfile?.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "U";

  const breadcrumbs = getBreadcrumbs(currentPath);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col h-full shadow-sidebar transition-all duration-300 z-20 bg-gradient-to-b from-[oklch(0.265_0.075_243)] to-[oklch(0.22_0.075_243)] ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <ShieldIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-lg leading-none">
                FTMS
              </div>
              <div className="text-white/50 text-[9px] uppercase tracking-widest leading-tight mt-0.5">
                Faculty &amp; Timetable
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const isActive =
                currentPath === item.href ||
                (item.href.length > 4 &&
                  currentPath.startsWith(item.href) &&
                  item.href !== "/admin/faculty");
              return (
                <button
                  key={item.href + item.label}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                  data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="flex-1 text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                  {sidebarOpen && isActive && (
                    <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full leading-none font-semibold">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User block */}
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-bold">
                {initials}
              </span>
            </div>
            {sidebarOpen ? (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold truncate">
                    {currentProfile?.name ?? "User"}
                  </div>
                  <div className="text-white/50 text-[10px]">
                    {roleLabelHindi} / {roleLabel}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-white/40 hover:text-white transition-colors"
                  title="Logout"
                  data-ocid="nav.logout_button"
                >
                  <LogOutIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="text-white/40 hover:text-white transition-colors mx-auto"
                title="Logout"
                data-ocid="nav.logout_button"
              >
                <LogOutIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {sidebarOpen ? (
                <XIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </button>
            <div>
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, i) => (
                    <BreadcrumbItem key={`${crumb.label}-${i}`}>
                      {i < breadcrumbs.length - 1 ? (
                        <>
                          <BreadcrumbLink
                            className="cursor-pointer text-xs"
                            onClick={() => crumb.href && navigate(crumb.href)}
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      ) : (
                        <BreadcrumbPage className="text-xs font-semibold">
                          {pageTitle}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <p className="text-[10px] text-muted-foreground">
                {roleLabelHindi} पोर्टल &mdash; {roleLabel} Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GlobalSearch navigate={navigate} />
            <div className="relative">
              <button
                type="button"
                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="header.notifications.button"
              >
                <BellIcon className="w-4 h-4" />
              </button>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold px-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">
                {initials}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
              data-ocid="header.logout_button"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary key={currentPath}>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

// ============ RENDER PAGE ============
function renderPage(
  role: "admin" | "teacher" | "checker",
  currentPath: string,
  currentProfile: FacultyProfile | null,
): React.ReactNode {
  if (role === "admin") {
    // Faculty detail dynamic route
    if (
      currentPath.startsWith("/admin/faculty/") &&
      currentPath !== "/admin/faculty/register"
    ) {
      const facultyId = currentPath.replace("/admin/faculty/", "");
      if (facultyId) return <FacultyDetail facultyId={facultyId} />;
    }

    switch (currentPath) {
      case "/":
      case "/admin":
        return <AdminDashboard />;
      case "/admin/faculty":
        return <FacultyManagement />;
      case "/admin/faculty/register":
        return <FacultyRegister />;
      case "/admin/timetable":
        return <TimetableBuilder />;
      case "/admin/billing":
        return <BillingOversight />;
      case "/admin/notifications":
        return <NotificationComposer />;
      case "/admin/rtgs":
        return <RtgsPayments />;
      case "/admin/users":
        return <UserManagement />;
      case "/admin/reports":
        return <ReportsAnalytics />;
      case "/admin/attendance":
        return <AttendanceTracker />;
      case "/admin/leaves":
        return <LeaveManagement />;
      case "/admin/calendar":
        return <AcademicCalendar />;
      case "/admin/settings":
        return <SystemSettings />;
      case "/admin/departments":
        return <Departments />;
      case "/admin/salary":
        return <SalarySlips />;
      case "/admin/noticeboard":
        return <NoticeBoardManager />;
      case "/admin/exams":
        return <ExamManagement />;
      case "/admin/workload":
        return <WorkloadPlanner />;
      case "/admin/substitutes":
        return <SubstituteManager />;
      case "/admin/audit":
        return <AuditLog />;
      case "/admin/holidays":
        return <HolidayManager />;
      case "/admin/bulk-upload":
        return <BulkUpload />;
      case "/admin/courses":
        return <CourseManagement />;
      case "/admin/students":
        return <StudentManagement />;
      case "/admin/attendance-status":
        return <AttendanceStatusAdmin />;
      case "/admin/performance":
        return <PerformanceReview />;
      case "/admin/fees":
        return <FeeManagement />;
      case "/admin/invoice":
        return <FacultyInvoice />;
      default:
        return <NotFoundPage />;
    }
  }

  if (role === "teacher" && currentProfile) {
    switch (currentPath) {
      case "/":
      case "/teacher":
        return <TeacherDashboard profile={currentProfile} />;
      case "/teacher/timetable":
        return <MyTimetable profile={currentProfile} />;
      case "/teacher/bill-entry":
        return <FacultyBillEntry profile={currentProfile} />;
      case "/teacher/bank":
        return <BankRegistration profile={currentProfile} />;
      case "/teacher/documents":
        return <Documents profile={currentProfile} />;
      case "/teacher/profile":
        return <Profile profile={currentProfile} />;
      case "/teacher/earnings":
        return <EarningsHistory profile={currentProfile} />;
      case "/teacher/announcements":
        return <AnnouncementBoard profile={currentProfile} />;
      case "/teacher/leave":
        return <LeaveApplication profile={currentProfile} />;
      case "/teacher/salary":
        return <SalarySlipTeacher profile={currentProfile} />;
      case "/teacher/noticeboard":
        return <NoticeBoardTeacher profile={currentProfile} />;
      case "/teacher/teaching-plan":
        return <TeachingPlan profile={currentProfile} />;
      case "/teacher/exams":
        return <ExamScheduleTeacher profile={currentProfile} />;
      case "/teacher/grievance":
        return <GrievancePortal profile={currentProfile} />;
      case "/teacher/student-attendance":
        return <StudentAttendancePage />;
      case "/teacher/exam-marks":
        return <ExamMarksPage />;
      case "/teacher/performance":
        return <PerformanceDashboard profile={currentProfile} />;
      case "/teacher/invoice":
        return <FacultyInvoice profile={currentProfile} />;
      default:
        return <NotFoundPage />;
    }
  }

  if (role === "checker" && currentProfile) {
    switch (currentPath) {
      case "/":
      case "/checker":
        return <CheckerDashboard />;
      case "/checker/bills":
        return <BillReview profile={currentProfile} />;
      case "/checker/approved":
        return <ApprovedBills profile={currentProfile} />;
      case "/checker/stats":
        return <CheckerStats profile={currentProfile} />;
      case "/checker/bulk":
        return <BulkBillProcessing />;
      default:
        return <NotFoundPage />;
    }
  }

  return null;
}

// ============ MAIN APP SHELL ============
export default function App() {
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const { upsertFacultyById, getFacultyById } = useFacultyStore();
  const { getNotificationsForUser, markAsRead, isRead } =
    useNotificationStore();

  const [credSession, setCredSession] = useState<CredentialSession | null>(
    () => {
      try {
        const stored = localStorage.getItem("ftms_session");
        return stored ? (JSON.parse(stored) as CredentialSession) : null;
      } catch {
        return null;
      }
    },
  );

  const [appRole, setAppRole] = useState<
    "admin" | "teacher" | "checker" | null
  >(null);
  const [isApproved, setIsApproved] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [currentPopupNotif, setCurrentPopupNotif] =
    useState<AppNotification | null>(null);
  const [shownPopupIds, setShownPopupIds] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState("/");
  const [userProfile, setUserProfile] = useState<
    UserProfile | null | undefined
  >(undefined);

  const isAuthenticated = !!identity;
  const principalId = identity?.getPrincipal().toString() ?? null;

  useEffect(() => {
    if (credSession) return;
    if (!actor || !isAuthenticated || isFetching) return;
    setIsLoadingRole(true);
    Promise.all([
      actor.getCallerUserRole(),
      actor.isCallerApproved(),
      actor.getUserProfile(),
    ])
      .then(([role, approved, profile]) => {
        let r: "admin" | "teacher" | "checker" = "teacher";
        if (role === UserRole.admin) r = "admin";
        else if ((role as string) === "checker") r = "checker";
        else if (role === UserRole.user) r = "teacher";
        setAppRole(r);
        setIsApproved(!!approved);
        setUserProfile(profile ?? null);

        // Auto-navigate to role dashboard after login if still on root
        setCurrentPath((prev) => (prev === "/" ? `/${r}` : prev));

        if (profile && principalId) {
          upsertFacultyById(principalId, {
            id: principalId,
            name: profile.name,
            email: profile.email ?? "",
            phone: profile.phone ?? "",
            qualifications: profile.qualifications ?? "",
            role: r,
            approvalStatus: approved ? "approved" : "pending",
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingRole(false));
  }, [
    actor,
    isAuthenticated,
    isFetching,
    principalId,
    credSession,
    upsertFacultyById,
  ]);

  useEffect(() => {
    if (!principalId && !credSession) return;
    const userId = credSession ? `cred_${credSession.username}` : principalId;
    if (!userId) return;

    const notifs = getNotificationsForUser(userId);
    for (const n of notifs) {
      if (!isRead(n.id, userId) && !shownPopupIds.has(n.id)) {
        if (!currentPopupNotif) {
          setCurrentPopupNotif(n);
          setShownPopupIds((prev) => new Set([...prev, n.id]));
          break;
        }
      }
    }
  }, [
    principalId,
    credSession,
    getNotificationsForUser,
    isRead,
    currentPopupNotif,
    shownPopupIds,
  ]);

  const handleRequestApproval = useCallback(async () => {
    if (!actor) return;
    try {
      await actor.requestApproval();
    } catch (e) {
      console.error(e);
    }
    setHasRequested(true);
  }, [actor]);

  const handleRegistered = useCallback(async () => {
    if (!actor) return;
    try {
      const profile = await actor.getUserProfile();
      setUserProfile(profile ?? null);
    } catch {
      // ignore
    }
    setHasRequested(true);
  }, [actor]);

  const handleCredentialLogin = useCallback((session: CredentialSession) => {
    localStorage.setItem("ftms_session", JSON.stringify(session));
    setCredSession(session);
    setCurrentPath(`/${session.role}`);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("ftms_session");
    setCredSession(null);
    clear();
    queryClient.clear();
    setAppRole(null);
    setIsApproved(false);
    setUserProfile(undefined);
    setCurrentPath("/");
  }, [clear, queryClient]);

  const navigate = useCallback((path: string) => setCurrentPath(path), []);

  const effectiveRole: "admin" | "teacher" | "checker" = credSession
    ? credSession.role
    : (appRole ?? "teacher");

  const effectivePrincipalId = credSession
    ? `cred_${credSession.username}`
    : principalId;

  const currentProfile: FacultyProfile | null = credSession
    ? ({
        id: `cred_${credSession.username}`,
        name: credSession.name,
        email: credSession.email,
        phone: credSession.phone,
        qualifications: credSession.qualifications,
        role: credSession.role,
        approvalStatus: "approved",
      } as FacultyProfile)
    : principalId
      ? (getFacultyById(principalId) ?? null)
      : null;

  if (
    !credSession &&
    (isInitializing ||
      isFetching ||
      isLoadingRole ||
      (isAuthenticated && userProfile === undefined))
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
          <p className="text-sm text-muted-foreground">
            लोड हो रहा है... / Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !credSession) {
    return (
      <LoginPage
        onLogin={login}
        isLoggingIn={isLoggingIn}
        onCredentialLogin={handleCredentialLogin}
      />
    );
  }

  if (!credSession && isAuthenticated && userProfile === null) {
    return (
      <RegistrationPage
        onRegistered={handleRegistered}
        onLogout={handleLogout}
      />
    );
  }

  if (
    !credSession &&
    isAuthenticated &&
    userProfile &&
    !isApproved &&
    appRole !== "admin"
  ) {
    return (
      <PendingApprovalPage
        onRequestApproval={handleRequestApproval}
        isRequesting={false}
        hasRequested={hasRequested}
        onLogout={handleLogout}
        userName={userProfile.name}
        userProfile={userProfile}
      />
    );
  }

  const pageTitle = PAGE_TITLES[currentPath] ?? "FTMS";

  return (
    <NavigationContext.Provider value={{ navigate, currentPath }}>
      <AppLayout
        role={effectiveRole}
        currentProfile={currentProfile}
        userId={effectivePrincipalId}
        onLogout={handleLogout}
        pageTitle={pageTitle}
        currentPath={currentPath}
        navigate={navigate}
      >
        {renderPage(effectiveRole, currentPath, currentProfile)}
      </AppLayout>

      <NotificationPopup
        notification={currentPopupNotif}
        userId={effectivePrincipalId ?? ""}
        onMarkRead={(id) => markAsRead(id, effectivePrincipalId ?? "")}
        onDismiss={() => setCurrentPopupNotif(null)}
      />
      <Toaster richColors position="top-right" />

      <footer className="fixed bottom-0 left-0 right-0 bg-transparent pointer-events-none py-1">
        <p className="text-center text-[10px] text-muted-foreground/40">
          &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="pointer-events-auto hover:text-muted-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </NavigationContext.Provider>
  );
}
