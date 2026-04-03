import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ClipboardCheck,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useCredentialAuth } from "../hooks/useCredentialAuth";
import type { CredentialSession } from "../hooks/useCredentialAuth";

interface LoginPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  onCredentialLogin: (session: CredentialSession) => void;
}

export function LoginPage({
  onLogin,
  isLoggingIn,
  onCredentialLogin,
}: LoginPageProps) {
  const { login } = useCredentialAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter username and password.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const session = await login(username.trim(), password);
      onCredentialLogin(session);
    } catch (err: any) {
      setError(err?.message ?? "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.265_0.075_243)] via-[oklch(0.22_0.075_243)] to-[oklch(0.18_0.08_243)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
            <Shield className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-white">FTMS</h1>
          <p className="text-white/60 text-sm mt-1 tracking-widest uppercase">
            Faculty &amp; Timetable Management System
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            शिक्षक और समयसारणी प्रबंधन प्रणाली
          </p>
        </motion.div>

        {/* Role cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            {
              icon: <Shield className="w-6 h-6" />,
              title: "Administrator",
              titleHindi: "प्रशासक",
              desc: "Manage faculty, timetables, billing, and system settings",
              color: "from-blue-500/20 to-blue-600/10",
            },
            {
              icon: <Users className="w-6 h-6" />,
              title: "Faculty / Teacher",
              titleHindi: "शिक्षक",
              desc: "View timetable, submit bills, manage profile and documents",
              color: "from-teal-500/20 to-teal-600/10",
            },
            {
              icon: <ClipboardCheck className="w-6 h-6" />,
              title: "Checker",
              titleHindi: "जांचकर्ता",
              desc: "Review and verify faculty-submitted daily class bills",
              color: "from-purple-500/20 to-purple-600/10",
            },
          ].map((role) => (
            <div
              key={role.title}
              className={`bg-gradient-to-br ${role.color} border border-white/10 rounded-xl p-5 text-white`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                {role.icon}
              </div>
              <h3 className="font-semibold text-sm">{role.title}</h3>
              <p className="text-white/50 text-[10px]">{role.titleHindi}</p>
              <p className="text-white/60 text-xs mt-2 leading-relaxed">
                {role.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Login card with tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-2xl p-8 max-w-md mx-auto shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
        >
          <h2 className="text-xl font-bold text-foreground mb-1">
            Sign In / लॉगिन
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Access your dashboard
          </p>

          <Tabs defaultValue="credentials">
            <TabsList className="w-full mb-5" data-ocid="login.tab">
              <TabsTrigger
                value="credentials"
                className="flex-1 gap-1.5"
                data-ocid="login.tab"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Username / Password
              </TabsTrigger>
              <TabsTrigger
                value="ii"
                className="flex-1 gap-1.5"
                data-ocid="login.tab"
              >
                <Shield className="w-3.5 h-3.5" />
                Internet Identity
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Username / Password */}
            <TabsContent value="credentials">
              <form onSubmit={handleCredentialSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-username">Username / यूज़रनेम</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    disabled={isSubmitting}
                    data-ocid="login.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password">Password / पासवर्ड</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      className="pr-10"
                      data-ocid="login.input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" data-ocid="login.error_state">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 text-sm font-semibold"
                  data-ocid="login.primary_button"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "Signing in..." : "Login / लॉगिन"}
                </Button>

                <div className="text-center text-[11px] text-muted-foreground space-y-1">
                  <p>
                    Admin:{" "}
                    <span className="font-mono bg-secondary px-1 rounded">
                      admin
                    </span>
                    {" / "}
                    <span className="font-mono bg-secondary px-1 rounded">
                      admin123
                    </span>
                  </p>
                  <p>
                    Checker:{" "}
                    <span className="font-mono bg-secondary px-1 rounded">
                      checker
                    </span>
                    {" / "}
                    <span className="font-mono bg-secondary px-1 rounded">
                      checker123
                    </span>
                  </p>
                </div>
              </form>
            </TabsContent>

            {/* Tab 2: Internet Identity */}
            <TabsContent value="ii">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Login with Internet Identity to access your dashboard
                </p>

                <Button
                  onClick={onLogin}
                  disabled={isLoggingIn}
                  className="w-full h-11 text-sm font-semibold"
                  data-ocid="login.ii_button"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  {isLoggingIn
                    ? "Connecting..."
                    : "Login with Internet Identity"}
                </Button>

                <div className="pt-2 border-t border-border">
                  <p className="text-[11px] text-muted-foreground text-center">
                    सुरक्षित इंटरनेट आइडेंटिटी से साइन इन करें
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/25 text-xs">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="text-white/40 hover:text-white/60 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
