import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell as BellIcon,
  Calendar as CalendarIcon,
  ClipboardCheck as ClipboardCheckIcon,
  CreditCard as CreditCardIcon,
  FileText as FileTextIcon,
  LayoutDashboard as LayoutDashboardIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  Upload as UploadIcon,
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
  useState,
} from "react";
import { UserRole } from "./backend";
import type { UserProfile } from "./backend.d";
import { NotificationPopup } from "./components/NotificationPopup";
import { useActor } from "./hooks/useActor";
import type { CredentialSession } from "./hooks/useCredentialAuth";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { LoginPage } from "./pages/LoginPage";
import { PendingApprovalPage } from "./pages/PendingApprovalPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { BillingOversight } from "./pages/admin/BillingOversight";
import { FacultyManagement } from "./pages/admin/FacultyManagement";
import { FacultyRegister } from "./pages/admin/FacultyRegister";
import { NotificationComposer } from "./pages/admin/NotificationComposer";
import { RtgsPayments } from "./pages/admin/RtgsPayments";
import { TimetableBuilder } from "./pages/admin/TimetableBuilder";
import { UserManagement } from "./pages/admin/UserManagement";
import { BillReview } from "./pages/checker/BillReview";
import { CheckerDashboard } from "./pages/checker/CheckerDashboard";
import { BankRegistration } from "./pages/teacher/BankRegistration";
import { BillSubmission } from "./pages/teacher/BillSubmission";
import { Documents } from "./pages/teacher/Documents";
import { MyTimetable } from "./pages/teacher/MyTimetable";
import { Profile } from "./pages/teacher/Profile";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { useFacultyStore } from "./store/useFacultyStore";
import { useNotificationStore } from "./store/useNotificationStore";
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

// Nav item definitions
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
    label: "Bills",
    href: "/teacher/bills",
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
    icon: <UsersIcon className="w-4 h-4" />,
    label: "Profile",
    href: "/teacher/profile",
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
];

// ============ LAYOUT ============
interface AppLayoutProps {
  children: React.ReactNode;
  role: "admin" | "teacher" | "checker";
  currentProfile: FacultyProfile | null;
  userId: string | null;
  onLogout: () => void;
  pageTitle: string;
  currentPath: string;
  navigate: (path: string) => void;
}

function AppLayout({
  children,
  role,
  currentProfile,
  userId,
  onLogout,
  pageTitle,
  currentPath,
  navigate,
}: AppLayoutProps) {
  const { getUnreadCount } = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const unreadCount = userId ? getUnreadCount(userId) : 0;
  const navItems =
    role === "admin"
      ? ADMIN_NAV_ITEMS
      : role === "teacher"
        ? TEACHER_NAV_ITEMS
        : CHECKER_NAV_ITEMS;
  const roleLabel =
    role === "admin"
      ? "Administrator"
      : role === "teacher"
        ? "Faculty"
        : "Checker";
  const roleLabelHindi =
    role === "admin" ? "प्रशासक" : role === "teacher" ? "शिक्षक" : "जांचकर्ता";
  const initials =
    currentProfile?.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "U";

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
                (item.href.length > 4 && currentPath.startsWith(item.href));
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
        <header className="bg-card border-b border-border px-6 py-3.5 flex items-center justify-between flex-shrink-0">
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
              <h1 className="text-xl font-bold text-foreground leading-none">
                {pageTitle}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {roleLabelHindi} पोर्टल &mdash; {roleLabel} Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 w-48">
              <SearchIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm placeholder:text-muted-foreground outline-none flex-1 w-full"
                data-ocid="header.search_input"
              />
            </div>
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

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

// ============ PAGE TITLE MAP ============
const PAGE_TITLES: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/faculty": "Faculty Management",
  "/admin/faculty/register": "Register Faculty",
  "/admin/timetable": "Timetable Builder",
  "/admin/billing": "Billing Oversight",
  "/admin/notifications": "Notifications",
  "/admin/rtgs": "RTGS Payments",
  "/admin/users": "User Management",
  "/teacher": "Teacher Dashboard",
  "/teacher/timetable": "My Timetable",
  "/teacher/bills": "Bill Submission",
  "/teacher/bank": "Bank Registration",
  "/teacher/documents": "Documents",
  "/teacher/profile": "My Profile",
  "/checker": "Checker Dashboard",
  "/checker/bills": "Bill Review",
};

// ============ RENDER PAGE ============
function renderPage(
  role: "admin" | "teacher" | "checker",
  currentPath: string,
  currentProfile: FacultyProfile | null,
): React.ReactNode {
  if (role === "admin") {
    switch (currentPath) {
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
      default:
        return <AdminDashboard />;
    }
  }
  if (role === "teacher" && currentProfile) {
    switch (currentPath) {
      case "/teacher":
        return <TeacherDashboard profile={currentProfile} />;
      case "/teacher/timetable":
        return <MyTimetable profile={currentProfile} />;
      case "/teacher/bills":
        return <BillSubmission profile={currentProfile} />;
      case "/teacher/bank":
        return <BankRegistration profile={currentProfile} />;
      case "/teacher/documents":
        return <Documents profile={currentProfile} />;
      case "/teacher/profile":
        return <Profile profile={currentProfile} />;
      default:
        return <TeacherDashboard profile={currentProfile} />;
    }
  }
  if (role === "checker" && currentProfile) {
    switch (currentPath) {
      case "/checker":
        return <CheckerDashboard />;
      case "/checker/bills":
        return <BillReview profile={currentProfile} />;
      default:
        return <CheckerDashboard />;
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

  // Credential session — read from localStorage on mount
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
  // undefined = not yet loaded, null = no profile, UserProfile = has profile
  const [userProfile, setUserProfile] = useState<
    UserProfile | null | undefined
  >(undefined);

  const isAuthenticated = !!identity;
  const principalId = identity?.getPrincipal().toString() ?? null;

  // Fetch role, approval, and user profile — only when using II auth
  useEffect(() => {
    if (credSession) return; // skip for credential auth
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
        else if (role === UserRole.user) r = "teacher";
        else if (role === UserRole.guest) r = "checker";
        setAppRole(r);
        setIsApproved(approved);
        setUserProfile(profile ?? null);
        // Set default path on role load
        if (r === "admin") setCurrentPath("/admin");
        else if (r === "teacher") setCurrentPath("/teacher");
        else setCurrentPath("/checker");
      })
      .catch(() => {
        setAppRole("teacher");
        setIsApproved(false);
        setUserProfile(null);
        setCurrentPath("/teacher");
      })
      .finally(() => setIsLoadingRole(false));
  }, [actor, isAuthenticated, isFetching, credSession]);

  // Ensure faculty profile exists in local store when we have backend profile (II auth)
  useEffect(() => {
    if (credSession) return;
    if (!principalId) return;
    const existing = getFacultyById(principalId);
    const profileName = userProfile?.name ?? existing?.name ?? "New Faculty";
    if (!existing) {
      upsertFacultyById(principalId, {
        id: principalId,
        name: profileName,
        email: userProfile?.email ?? "",
        phone: userProfile?.phone ?? "",
        qualifications: userProfile?.qualifications ?? "",
        role: appRole ?? "teacher",
        approvalStatus: "pending",
      });
    }
  }, [
    principalId,
    getFacultyById,
    upsertFacultyById,
    appRole,
    userProfile,
    credSession,
  ]);

  // When credential session is active, seed the faculty store from it
  useEffect(() => {
    if (!credSession) return;
    const credId = `cred_${credSession.username}`;
    const existing = getFacultyById(credId);
    if (!existing) {
      upsertFacultyById(credId, {
        id: credId,
        name: credSession.name,
        email: credSession.email,
        phone: credSession.phone,
        qualifications: credSession.qualifications,
        role: credSession.role,
        approvalStatus: "approved",
      });
    }
    // Set the correct default path for the role
    const role = credSession.role;
    if (role === "admin") setCurrentPath("/admin");
    else if (role === "teacher") setCurrentPath("/teacher");
    else setCurrentPath("/checker");
  }, [credSession, getFacultyById, upsertFacultyById]);

  // Notification popup logic
  useEffect(() => {
    const effectivePrincipal = credSession
      ? `cred_${credSession.username}`
      : principalId;
    if (!effectivePrincipal) return;
    const notifs = getNotificationsForUser(effectivePrincipal);
    const unread = notifs.filter(
      (n) => !isRead(n.id, effectivePrincipal) && !shownPopupIds.has(n.id),
    );
    if (unread.length > 0 && !currentPopupNotif) {
      const first = unread[0];
      setCurrentPopupNotif(first);
      setShownPopupIds((prev) => new Set([...prev, first.id]));
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

  // Determine effective role and profile
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

  // Loading state — credential sessions skip the II initialization wait
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

  // Not authenticated via either method — show login page
  if (!isAuthenticated && !credSession) {
    return (
      <LoginPage
        onLogin={login}
        isLoggingIn={isLoggingIn}
        onCredentialLogin={handleCredentialLogin}
      />
    );
  }

  // Authenticated via II but no profile — show registration
  if (!credSession && isAuthenticated && userProfile === null) {
    return (
      <RegistrationPage
        onRegistered={handleRegistered}
        onLogout={handleLogout}
      />
    );
  }

  // Has II profile but awaiting approval (non-admin)
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

      {/* Footer */}
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
