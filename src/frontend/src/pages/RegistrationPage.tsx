import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Shield, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { AppRole } from "../backend";
import { useActor } from "../hooks/useActor";

interface RegistrationPageProps {
  onRegistered: () => void;
  onLogout: () => void;
}

export function RegistrationPage({
  onRegistered,
  onLogout,
}: RegistrationPageProps) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AppRole.teacher | AppRole.checker>(
    AppRole.teacher,
  );
  const [qualifications, setQualifications] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await actor.registerUser(
        name.trim(),
        email.trim(),
        phone.trim(),
        role,
        qualifications.trim(),
      );
      await actor.requestApproval();
      onRegistered();
    } catch (err: any) {
      setError(err?.message ?? "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.265_0.075_243)] via-[oklch(0.22_0.075_243)] to-[oklch(0.18_0.08_243)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Brand header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4">
            <Shield className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-white">FTMS</h1>
          <p className="text-white/60 text-sm mt-1 tracking-widest uppercase">
            Faculty &amp; Timetable Management
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            शिक्षक और समयसारणी प्रबंधन प्रणाली
          </p>
        </motion.div>

        {/* Registration card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-2xl p-8 shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground leading-none">
                Register / पंजीकरण
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create your faculty profile to get started
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-ocid="registration.modal"
          >
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-sm font-medium">
                Full Name / पूरा नाम <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-name"
                type="text"
                placeholder="Dr. Ramesh Kumar Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                data-ocid="registration.input"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-sm font-medium">
                Email / ईमेल <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="faculty@college.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                data-ocid="registration.input"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-phone" className="text-sm font-medium">
                Phone / फ़ोन नंबर <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={isSubmitting}
                data-ocid="registration.input"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-role" className="text-sm font-medium">
                Role / भूमिका <span className="text-destructive">*</span>
              </Label>
              <Select
                value={role}
                onValueChange={(val) =>
                  setRole(val as AppRole.teacher | AppRole.checker)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="reg-role" data-ocid="registration.select">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AppRole.teacher}>
                    Faculty / Teacher (शिक्षक)
                  </SelectItem>
                  <SelectItem value={AppRole.checker}>
                    Checker (जांचकर्ता)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Admin accounts are created by administrators only.
              </p>
            </div>

            {/* Qualifications */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-qual" className="text-sm font-medium">
                Qualifications / योग्यताएं
              </Label>
              <Textarea
                id="reg-qual"
                placeholder="M.Tech (Computer Science), B.Ed, UGC-NET..."
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="resize-none"
                data-ocid="registration.textarea"
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3"
                data-ocid="registration.error_state"
              >
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 font-semibold"
              data-ocid="registration.submit_button"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isSubmitting
                ? "Registering... / पंजीकरण हो रहा है..."
                : "Register & Request Approval / पंजीकरण करें"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onLogout}
              disabled={isSubmitting}
              className="w-full text-muted-foreground hover:text-foreground"
              data-ocid="registration.cancel_button"
            >
              Logout / लॉगआउट
            </Button>
          </form>
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
