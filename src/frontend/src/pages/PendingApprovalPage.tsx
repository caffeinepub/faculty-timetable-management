import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile } from "../backend.d";

interface PendingApprovalPageProps {
  onRequestApproval: () => void;
  isRequesting: boolean;
  hasRequested: boolean;
  onLogout: () => void;
  userName?: string;
  userProfile?: UserProfile | null;
}

export function PendingApprovalPage({
  onRequestApproval,
  isRequesting,
  hasRequested,
  onLogout,
  userName,
  userProfile,
}: PendingApprovalPageProps) {
  const displayName = userProfile?.name ?? userName;
  const roleLabel =
    userProfile?.role === "admin"
      ? "Administrator"
      : userProfile?.role === "checker"
        ? "Checker (जांचकर्ता)"
        : "Faculty / Teacher (शिक्षक)";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.265_0.075_243)] to-[oklch(0.18_0.08_243)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-8 max-w-md w-full shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {hasRequested ? "Approval Pending" : "Request Access"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {hasRequested
              ? "आपकी अनुमोदन स्वीकृति की प्रतीक्षा है / Your approval is pending"
              : "प्रवेश के लिए अनुरोध करें / Request access to the system"}
          </p>
        </div>

        {/* Profile details card */}
        {userProfile && (
          <div className="bg-secondary/60 rounded-xl p-4 mb-5 space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Submitted Profile / जमा किया प्रोफ़ाइल
            </p>
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">नाम / Name</p>
                <p className="text-sm font-semibold text-foreground">
                  {userProfile.name}
                </p>
              </div>
            </div>
            {userProfile.email && (
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">ईमेल / Email</p>
                  <p className="text-sm text-foreground">{userProfile.email}</p>
                </div>
              </div>
            )}
            {userProfile.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">फ़ोन / Phone</p>
                  <p className="text-sm text-foreground">{userProfile.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">भूमिका / Role</p>
                <Badge variant="outline" className="text-xs mt-0.5">
                  {roleLabel}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Show plain name if no full profile */}
        {!userProfile && displayName && (
          <div className="bg-secondary rounded-lg p-3 mb-5 text-center">
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="text-sm font-semibold text-foreground">
              {displayName}
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {[
            {
              icon: <Shield className="w-4 h-4 text-primary" />,
              text: "Your account needs admin approval to access the system",
            },
            {
              icon: <Clock className="w-4 h-4 text-amber-500" />,
              text: "Approval is typically processed within 24 hours",
            },
            {
              icon: <CheckCircle className="w-4 h-4 text-green-500" />,
              text: "Once approved, you can log in and access your dashboard",
            },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {!hasRequested ? (
            <Button
              onClick={onRequestApproval}
              disabled={isRequesting}
              className="w-full"
              data-ocid="approval.primary_button"
            >
              {isRequesting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isRequesting ? "Requesting..." : "Request Approval / अनुमोदन माँगें"}
            </Button>
          ) : (
            <div
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center"
              data-ocid="approval.success_state"
            >
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-amber-700">
                अनुरोध भेजा गया
              </p>
              <p className="text-xs text-amber-600">
                Approval request submitted. Please wait.
              </p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full"
            data-ocid="approval.cancel_button"
          >
            Logout / लॉगआउट
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
