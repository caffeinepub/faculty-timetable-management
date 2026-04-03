import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Phone,
  RotateCcw,
  UserPlus,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigation } from "../../App";
import { useDepartmentStore } from "../../store/useDepartmentStore";
import { useFacultyStore } from "../../store/useFacultyStore";

function FieldGroup({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-1 block">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function FacultyRegister() {
  const { navigate } = useNavigation();
  const { addFaculty } = useFacultyStore();
  const { departments } = useDepartmentStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"teacher" | "checker">("teacher");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [yearlyLimit, setYearlyLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState<string | null>(null);

  const selectedDept = departments.find((d) => d.id === selectedDeptId) ?? null;
  const designationOptions = selectedDept?.designations ?? [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
    "Guest Faculty",
    "Account Checker",
    "Other",
  ];

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setDesignation(""); // reset designation when dept changes
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("teacher");
    setSelectedDeptId("");
    setDesignation("");
    setQualifications("");
    setMonthlyLimit("");
    setYearlyLimit("");
    setRegistered(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("कृपया सभी आवश्यक खाने भरें / Please fill all required fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Valid email address required / वैध ईमेल पता आवश्यक है");
      return;
    }
    if (monthlyLimit && Number(monthlyLimit) <= 0) {
      toast.error("Monthly limit must be a positive number");
      return;
    }
    if (yearlyLimit && Number(yearlyLimit) <= 0) {
      toast.error("Yearly limit must be a positive number");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const deptName = selectedDept?.name ?? undefined;
      const profile = addFaculty({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        qualifications: qualifications.trim(),
        department: deptName,
        designation: designation || undefined,
        monthlyLimit: monthlyLimit ? Number(monthlyLimit) : undefined,
        yearlyLimit: yearlyLimit ? Number(yearlyLimit) : undefined,
        approvalStatus: "approved",
      });
      setIsSubmitting(false);
      setRegistered(profile.name);
      toast.success(`${profile.name} registered successfully`);
    }, 600);
  };

  if (registered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20"
        data-ocid="faculty_register.success_state"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Registered!</h2>
        <p className="text-muted-foreground text-sm mb-2">
          <span className="font-semibold text-foreground">{registered}</span>{" "}
          has been added to the faculty list.
        </p>
        <p className="text-xs text-muted-foreground mb-8">
          पंजीकरण सफल हो गया / Registration successful
        </p>
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            data-ocid="faculty_register.register_another_button"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Register Another / एक और जोड़ें
          </Button>
          <Button
            onClick={() => navigate("/admin/faculty")}
            data-ocid="faculty_register.view_faculty_button"
          >
            View Faculty List / सूची देखें
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 max-w-3xl"
      data-ocid="faculty_register.page"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/faculty")}
          className="text-muted-foreground"
          data-ocid="faculty_register.back_button"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Register Faculty / शिक्षक पंजीकरण</h2>
          <p className="text-xs text-muted-foreground">
            Add a new faculty or checker to the system
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        data-ocid="faculty_register.form"
      >
        {/* Personal Information */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Personal Information / व्यक्तिगत जानकारी
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup label="Full Name / पूरा नाम *">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Ramesh Kumar Sharma"
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                  data-ocid="faculty_register.name.input"
                />
              </FieldGroup>
              <FieldGroup label="Email / ईमेल *">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@college.edu.in"
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                  data-ocid="faculty_register.email.input"
                />
              </FieldGroup>
              <FieldGroup label="Phone / फ़ोन नंबर *">
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    disabled={isSubmitting}
                    className="pl-8"
                    data-ocid="faculty_register.phone.input"
                  />
                </div>
              </FieldGroup>
              <FieldGroup label="Role / भूमिका *">
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as "teacher" | "checker")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="faculty_register.role.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">
                      Faculty / Teacher (शिक्षक)
                    </SelectItem>
                    <SelectItem value="checker">Checker (जांचकर्ता)</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Academic Information / शैक्षणिक जानकारी
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup label="Department / विभाग">
                <Select
                  value={selectedDeptId}
                  onValueChange={handleDeptChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="faculty_register.department.select"
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
              <FieldGroup label="Designation / पदनाम">
                <Select
                  value={designation}
                  onValueChange={setDesignation}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="faculty_register.designation.select"
                  >
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designationOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>
            <FieldGroup label="Qualifications / योग्यताएं">
              <Textarea
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="M.Tech (Computer Science), B.Ed, UGC-NET..."
                rows={3}
                disabled={isSubmitting}
                className="resize-none mt-1"
                data-ocid="faculty_register.qualifications.textarea"
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Earning Limits */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Earning Limits / कमाई सीमा
              <span className="text-[10px] font-normal text-muted-foreground ml-1">
                (optional / वैकल्पिक)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldGroup label="Monthly Limit / मासिक सीमा (₹)">
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    placeholder="e.g. 50000"
                    min={1}
                    disabled={isSubmitting}
                    className="pl-7"
                    data-ocid="faculty_register.monthly_limit.input"
                  />
                </div>
              </FieldGroup>
              <FieldGroup label="Yearly Limit / वार्षिक सीमा (₹)">
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={yearlyLimit}
                    onChange={(e) => setYearlyLimit(e.target.value)}
                    placeholder="e.g. 600000"
                    min={1}
                    disabled={isSubmitting}
                    className="pl-7"
                    data-ocid="faculty_register.yearly_limit.input"
                  />
                </div>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-11 font-semibold"
            data-ocid="faculty_register.submit_button"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isSubmitting
              ? "Registering... / पंजीकरण हो रहा है..."
              : "Register Faculty / पंजीकरण करें"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            className="h-11"
            data-ocid="faculty_register.reset_button"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
