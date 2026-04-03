import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  DoorOpen,
  FileCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { AppRole } from "../hooks/useAuth";
import { useNotificationStore } from "../store/useNotificationStore";
import type { FacultyProfile } from "../types/models";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  labelHindi: string;
  href: string;
}

const ADMIN_NAV: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-4 h-4" />,
    label: "Dashboard",
    labelHindi: "डैशबोर्ड",
    href: "/admin",
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: "Timetables",
    labelHindi: "समयसारणी",
    href: "/admin/timetable",
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: "Faculty Management",
    labelHindi: "शिक्षक प्रबंधन",
    href: "/admin/faculty",
  },
  {
    icon: <DoorOpen className="w-4 h-4" />,
    label: "Room Allocation",
    labelHindi: "कक्ष आवंटन",
    href: "/admin/timetable",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: "Billing Oversight",
    labelHindi: "बिलिंग",
    href: "/admin/billing",
  },
  {
    icon: <CreditCard className="w-4 h-4" />,
    label: "RTGS Payments",
    labelHindi: "आरटीजीएस",
    href: "/admin/rtgs",
  },
  {
    icon: <Bell className="w-4 h-4" />,
    label: "Notifications",
    labelHindi: "सूचनाएं",
    href: "/admin/notifications",
  },
  {
    icon: <Settings className="w-4 h-4" />,
    label: "Settings",
    labelHindi: "सेटिंग्स",
    href: "/admin",
  },
];

const TEACHER_NAV: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-4 h-4" />,
    label: "Dashboard",
    labelHindi: "डैशबोर्ड",
    href: "/teacher",
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: "My Timetable",
    labelHindi: "मेरी समयसारणी",
    href: "/teacher/timetable",
  },
  {
    icon: <FileText className="w-4 h-4" />,
    label: "Bill Submission",
    labelHindi: "बिल जमा",
    href: "/teacher/bills",
  },
  {
    icon: <CreditCard className="w-4 h-4" />,
    label: "Bank Registration",
    labelHindi: "बैंक जानकारी",
    href: "/teacher/bank",
  },
  {
    icon: <Upload className="w-4 h-4" />,
    label: "Documents",
    labelHindi: "दस्तावेज",
    href: "/teacher/documents",
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: "My Profile",
    labelHindi: "मेरी प्रोफाइल",
    href: "/teacher/profile",
  },
];

const CHECKER_NAV: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-4 h-4" />,
    label: "Dashboard",
    labelHindi: "डैशबोर्ड",
    href: "/checker",
  },
  {
    icon: <ClipboardCheck className="w-4 h-4" />,
    label: "Bill Review",
    labelHindi: "बिल समीक्षा",
    href: "/checker/bills",
  },
  {
    icon: <FileCheck className="w-4 h-4" />,
    label: "Reports",
    labelHindi: "रिपोर्ट",
    href: "/checker",
  },
];

interface LayoutProps {
  children: React.ReactNode;
  role: AppRole;
  currentProfile: FacultyProfile | null;
  userId: string | null;
  onLogout: () => void;
  pageTitle: string;
}

export function Layout({
  children,
  role,
  currentProfile,
  userId,
  onLogout,
  pageTitle,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { getUnreadCount } = useNotificationStore();

  const navItems =
    role === "admin"
      ? ADMIN_NAV
      : role === "teacher"
        ? TEACHER_NAV
        : CHECKER_NAV;

  const unreadCount = userId ? getUnreadCount(userId) : 0;

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
        className={cn(
          "flex flex-col h-full shadow-sidebar transition-all duration-300 z-20",
          "bg-gradient-to-b from-[oklch(0.265_0.075_243)] to-[oklch(0.22_0.075_243)]",
          sidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary-foreground" />
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
                location.pathname === item.href ||
                (item.href !== "/admin" &&
                  item.href !== "/teacher" &&
                  item.href !== "/checker" &&
                  location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href + item.label}
                  to={item.href as any}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white",
                  )}
                  data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="flex-1 text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                  {sidebarOpen && isActive && (
                    <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 leading-none">
                      Active
                    </Badge>
                  )}
                  {sidebarOpen && !isActive && (
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User block */}
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              {currentProfile?.photoUrl && (
                <AvatarImage src={currentProfile.photoUrl} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen ? (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold truncate">
                    {currentProfile?.name ?? "User"}
                  </div>
                  <div className="text-white/50 text-[10px] truncate">
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
                  <LogOut className="w-4 h-4" />
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
                <LogOut className="w-4 h-4" />
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
              data-ocid="nav.menu.toggle"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
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
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 w-48">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 w-full"
                data-ocid="header.search_input"
              />
            </div>

            {/* Notification bell */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="header.notifications.button"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Avatar */}
            <Avatar className="w-8 h-8">
              {currentProfile?.photoUrl && (
                <AvatarImage src={currentProfile.photoUrl} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
              data-ocid="header.logout_button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
