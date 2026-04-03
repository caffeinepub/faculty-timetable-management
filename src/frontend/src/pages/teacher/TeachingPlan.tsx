import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useHolidayStore } from "../../store/useHolidayStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { FacultyProfile } from "../../types/models";

// =================== HOLIDAY DATA ===================
const HOLIDAYS_2026: string[] = [
  "2026-01-14", // Makar Sankranti
  "2026-01-26", // Republic Day
  "2026-02-26", // Maha Shivratri
  "2026-03-19", // Holi
  "2026-03-25", // Id-ul-Fitr
  "2026-04-02", // Ram Navami
  "2026-04-05", // Mahavir Jayanti
  "2026-04-06", // Good Friday
  "2026-04-14", // Ambedkar Jayanti
  "2026-04-26", // Hanuman Jayanti
  "2026-05-24", // Buddha Purnima
  "2026-06-15", // Eid ul-Adha
  "2026-08-15", // Independence Day
  "2026-08-22", // Raksha Bandhan
  "2026-08-30", // Janmashtami
  "2026-09-18", // Id-e-Milad
  "2026-10-02", // Gandhi Jayanti / Dussehra
  "2026-10-20", // Diwali (Lakshmi Puja)
  "2026-10-21", // Diwali
  "2026-10-22", // Govardhan Puja
  "2026-11-05", // Guru Nanak Jayanti
  "2026-12-25", // Christmas
];

const HOLIDAYS_2025: string[] = [
  "2025-01-14", // Makar Sankranti
  "2025-01-26", // Republic Day
  "2025-02-26", // Maha Shivratri
  "2025-03-14", // Holi
  "2025-03-31", // Id-ul-Fitr
  "2025-04-10", // Ram Navami
  "2025-04-14", // Ambedkar Jayanti / Mahavir Jayanti
  "2025-04-18", // Good Friday
  "2025-05-12", // Buddha Purnima
  "2025-06-07", // Eid ul-Adha
  "2025-08-09", // Raksha Bandhan
  "2025-08-15", // Independence Day
  "2025-08-16", // Janmashtami
  "2025-10-02", // Gandhi Jayanti / Dussehra
  "2025-10-20", // Diwali
  "2025-10-21", // Govardhan Puja
  "2025-11-05", // Guru Nanak Jayanti
  "2025-12-25", // Christmas
];

const HOLIDAY_NAMES_2026: Record<string, string> = {
  "2026-01-14": "Makar Sankranti",
  "2026-01-26": "Republic Day",
  "2026-02-26": "Maha Shivratri",
  "2026-03-19": "Holi",
  "2026-03-25": "Id-ul-Fitr",
  "2026-04-02": "Ram Navami",
  "2026-04-05": "Mahavir Jayanti",
  "2026-04-06": "Good Friday",
  "2026-04-14": "Ambedkar Jayanti",
  "2026-04-26": "Hanuman Jayanti",
  "2026-05-24": "Buddha Purnima",
  "2026-06-15": "Eid ul-Adha",
  "2026-08-15": "Independence Day",
  "2026-08-22": "Raksha Bandhan",
  "2026-08-30": "Janmashtami",
  "2026-09-18": "Id-e-Milad",
  "2026-10-02": "Gandhi Jayanti / Dussehra",
  "2026-10-20": "Diwali (Lakshmi Puja)",
  "2026-10-21": "Diwali",
  "2026-10-22": "Govardhan Puja",
  "2026-11-05": "Guru Nanak Jayanti",
  "2026-12-25": "Christmas",
};

const HOLIDAY_NAMES_2025: Record<string, string> = {
  "2025-01-14": "Makar Sankranti",
  "2025-01-26": "Republic Day",
  "2025-02-26": "Maha Shivratri",
  "2025-03-14": "Holi",
  "2025-03-31": "Id-ul-Fitr",
  "2025-04-10": "Ram Navami",
  "2025-04-14": "Ambedkar Jayanti / Mahavir Jayanti",
  "2025-04-18": "Good Friday",
  "2025-05-12": "Buddha Purnima",
  "2025-06-07": "Eid ul-Adha",
  "2025-08-09": "Raksha Bandhan",
  "2025-08-15": "Independence Day",
  "2025-08-16": "Janmashtami",
  "2025-10-02": "Gandhi Jayanti / Dussehra",
  "2025-10-20": "Diwali",
  "2025-10-21": "Govardhan Puja",
  "2025-11-05": "Guru Nanak Jayanti",
  "2025-12-25": "Christmas",
};

// =================== TYPES ===================
interface FormState {
  teacherName: string;
  batchName: string;
  semesterId: string;
  subjectId: string;
  paperType: string;
  totalClasses: number;
  startDate: string;
  academicYear: string;
  selectedDays: number[];
  holidaySet: "2025" | "2026" | "none";
}

interface ScheduleRow {
  sno: number;
  batch: string;
  date: string;
  dateObj: Date;
  day: string;
  month: string;
  monthKey: string;
  topic: string;
}

interface FormErrors {
  semesterId?: string;
  subjectId?: string;
  totalClasses?: string;
  startDate?: string;
  selectedDays?: string;
}

interface TeachingPlanProps {
  profile: FacultyProfile;
}

// =================== STATIC FALLBACK SEMESTERS ===================
const STATIC_SEMESTERS = [
  {
    id: "s-bca1",
    name: "BCA Semester I",
    program: "BCA",
    semesterNumber: 1,
    isActive: true,
  },
  {
    id: "s-bca2",
    name: "BCA Semester II",
    program: "BCA",
    semesterNumber: 2,
    isActive: true,
  },
  {
    id: "s-bca3",
    name: "BCA Semester III",
    program: "BCA",
    semesterNumber: 3,
    isActive: true,
  },
  {
    id: "s-bca4",
    name: "BCA Semester IV",
    program: "BCA",
    semesterNumber: 4,
    isActive: true,
  },
  {
    id: "s-bca5",
    name: "BCA Semester V",
    program: "BCA",
    semesterNumber: 5,
    isActive: true,
  },
  {
    id: "s-bca6",
    name: "BCA Semester VI",
    program: "BCA",
    semesterNumber: 6,
    isActive: true,
  },
  {
    id: "s-msc1",
    name: "M.Sc. IT Semester I",
    program: "M.Sc. IT",
    semesterNumber: 1,
    isActive: true,
  },
  {
    id: "s-msc2",
    name: "M.Sc. IT Semester II",
    program: "M.Sc. IT",
    semesterNumber: 2,
    isActive: true,
  },
  {
    id: "s-msc3",
    name: "M.Sc. IT Semester III",
    program: "M.Sc. IT",
    semesterNumber: 3,
    isActive: true,
  },
  {
    id: "s-msc4",
    name: "M.Sc. IT Semester IV",
    program: "M.Sc. IT",
    semesterNumber: 4,
    isActive: true,
  },
];

// Day color map
const DAY_COLORS: Record<string, string> = {
  Monday: "bg-blue-100 text-blue-700 border-blue-200",
  Tuesday: "bg-teal-100 text-teal-700 border-teal-200",
  Wednesday: "bg-purple-100 text-purple-700 border-purple-200",
  Thursday: "bg-amber-100 text-amber-700 border-amber-200",
  Friday: "bg-green-100 text-green-700 border-green-200",
  Saturday: "bg-orange-100 text-orange-700 border-orange-200",
};

const WORKING_DAYS = [
  { label: "Mon", labelHi: "सोम", value: 1 },
  { label: "Tue", labelHi: "मंगल", value: 2 },
  { label: "Wed", labelHi: "बुध", value: 3 },
  { label: "Thu", labelHi: "गुरु", value: 4 },
  { label: "Fri", labelHi: "शुक्र", value: 5 },
  { label: "Sat", labelHi: "शनि", value: 6 },
];

// =================== GENERATION LOGIC ===================
function generateSchedule(params: {
  totalClasses: number;
  startDate: string;
  selectedDays: number[];
  holidaySet: "2025" | "2026" | "none";
  batchLabel: string;
  externalHolidays?: string[];
}): { schedule: ScheduleRow[]; totalIterations: number } {
  const {
    totalClasses,
    startDate,
    selectedDays,
    holidaySet,
    batchLabel,
    externalHolidays,
  } = params;
  const holidays =
    holidaySet === "2026"
      ? externalHolidays && externalHolidays.length > 0
        ? externalHolidays
        : HOLIDAYS_2026
      : holidaySet === "2025"
        ? HOLIDAYS_2025
        : [];

  const schedule: ScheduleRow[] = [];
  let count = 1;
  let current = new Date(startDate);
  const MAX_ITERATIONS = 2000;
  let iterations = 0;

  while (count <= totalClasses && iterations < MAX_ITERATIONS) {
    iterations++;
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split("T")[0];

    const is2ndSaturday =
      dayOfWeek === 6 && current.getDate() >= 8 && current.getDate() <= 14;
    const isSunday = dayOfWeek === 0;
    const isHoliday = holidays.includes(dateStr);
    const isWorkingDay = selectedDays.includes(dayOfWeek);

    if (!isSunday && !is2ndSaturday && !isHoliday && isWorkingDay) {
      schedule.push({
        sno: count,
        batch: batchLabel,
        date: current.toLocaleDateString("en-GB"),
        dateObj: new Date(current),
        day: current.toLocaleDateString("en-US", { weekday: "long" }),
        month: current.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        monthKey: `${current.getFullYear()}-${current.getMonth()}`,
        topic: `Class ${count}`,
      });
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return { schedule, totalIterations: iterations };
}

// =================== COMPONENT ===================
export function TeachingPlan({ profile }: TeachingPlanProps) {
  const { semesters: storeSemesters, subjects: storeSubjects } =
    useTimetableStore();
  const { getHolidayDates } = useHolidayStore();

  const allSemesters =
    storeSemesters.length > 0 ? storeSemesters : STATIC_SEMESTERS;

  const today = new Date().toISOString().split("T")[0];
  const currentYear = new Date().getFullYear();
  const academicYearDefault = `${currentYear}-${String(currentYear + 1).slice(2)}`;

  const [formData, setFormData] = useState<FormState>({
    teacherName: profile.name,
    batchName: "",
    semesterId: "",
    subjectId: "",
    paperType: "Theory",
    totalClasses: 45,
    startDate: today,
    academicYear: academicYearDefault,
    selectedDays: [1, 2, 3, 4, 5],
    holidaySet: "2026",
  });

  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generated, setGenerated] = useState(false);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [holidaysSkipped, setHolidaysSkipped] = useState(0);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Inject print styles
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.id = "teaching-plan-print-style";
    styleEl.textContent = `
      @media print {
        body * { visibility: hidden; }
        #teaching-plan-print-area, #teaching-plan-print-area * { visibility: visible; }
        #teaching-plan-print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 20px;
        }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      const el = document.getElementById("teaching-plan-print-style");
      if (el) el.remove();
    };
  }, []);

  // Filtered subjects
  const filteredSubjects = storeSubjects.filter((s) =>
    formData.semesterId ? s.semesterId === formData.semesterId : true,
  );

  const selectedSemesterName =
    allSemesters.find((s) => s.id === formData.semesterId)?.name ?? "";
  const selectedSubject = storeSubjects.find(
    (s) => s.id === formData.subjectId,
  );
  const selectedSubjectLabel = selectedSubject
    ? `${selectedSubject.code} — ${selectedSubject.name}`
    : formData.subjectId || "";

  // Auto-select paper type from subject
  const handleSubjectChange = useCallback(
    (subjectId: string) => {
      const sub = storeSubjects.find((s) => s.id === subjectId);
      setFormData((prev) => ({
        ...prev,
        subjectId,
        paperType: sub ? sub.type : prev.paperType,
      }));
    },
    [storeSubjects],
  );

  const handleDayToggle = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day].sort(),
    }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.semesterId)
      errs.semesterId = "Please select a class/semester";
    if (!formData.subjectId && storeSubjects.length > 0)
      errs.subjectId = "Please select a subject";
    if (formData.totalClasses < 1 || formData.totalClasses > 200)
      errs.totalClasses = "Classes must be between 1 and 200";
    if (!formData.startDate) errs.startDate = "Please select a start date";
    if (formData.selectedDays.length === 0)
      errs.selectedDays = "Select at least one working day";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;

    const batchLabel = formData.batchName || "—";
    const { schedule: newSchedule, totalIterations } = generateSchedule({
      totalClasses: formData.totalClasses,
      startDate: formData.startDate,
      selectedDays: formData.selectedDays,
      holidaySet: formData.holidaySet,
      batchLabel,
      externalHolidays:
        formData.holidaySet === "2026" ? getHolidayDates() : undefined,
    });

    const skipped = totalIterations - newSchedule.length;
    setSchedule(newSchedule);
    setHolidaysSkipped(skipped);
    setGenerated(true);
    setFormCollapsed(true);
    toast.success(
      `Teaching plan generated! ${newSchedule.length} classes scheduled. / ${newSchedule.length} कक्षाएं निर्धारित की गईं।`,
    );
  };

  const handleReset = () => {
    setGenerated(false);
    setFormCollapsed(false);
    setSchedule([]);
    setErrors({});
  };

  const handleTopicChange = (index: number, value: string) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], topic: value };
      return updated;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const doExport = () => {
      const XLSX = (window as any).XLSX;
      const headerInfo: any[][] = [
        [`Teaching Plan — Academic Year ${formData.academicYear}`],
        [`Teacher: ${formData.teacherName}`],
        [
          `Class: ${selectedSemesterName} | Batch: ${formData.batchName || "—"} | Subject: ${selectedSubjectLabel}`,
        ],
        [
          `Paper Type: ${formData.paperType} | Total Classes: ${formData.totalClasses}`,
        ],
        [],
        ["S.No.", "Batch", "Date", "Day", "Proposed Topic"],
      ];

      const rows = schedule.map((row) => [
        row.sno,
        row.batch,
        row.date,
        row.day,
        row.topic,
      ]);
      const allData = [...headerInfo, ...rows];

      const ws = XLSX.utils.aoa_to_sheet(allData);
      ws["!cols"] = [
        { wch: 6 },
        { wch: 12 },
        { wch: 14 },
        { wch: 12 },
        { wch: 45 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Teaching Plan");
      const filename = `Teaching_Plan_${(selectedSemesterName || "Class").replace(/ /g, "_")}_${formData.academicYear}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success("Excel file downloaded! / Excel फ़ाइल डाउनलोड हो गई!");
    };

    if (!(window as any).XLSX) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.onload = () => doExport();
      script.onerror = () =>
        toast.error(
          "Failed to load Excel library. Check your internet connection.",
        );
      document.head.appendChild(script);
    } else {
      doExport();
    }
  };

  // Build month groups for rendering
  const monthGroups = (() => {
    const seen = new Set<string>();
    return schedule.map((row) => {
      const isNewMonth = !seen.has(row.monthKey);
      seen.add(row.monthKey);
      return { ...row, isNewMonth };
    });
  })();

  const workingDayLabels = WORKING_DAYS.filter((d) =>
    formData.selectedDays.includes(d.value),
  )
    .map((d) => d.label)
    .join(" ");

  const monthRange = (() => {
    if (schedule.length === 0) return "";
    const first = schedule[0].month;
    const last = schedule[schedule.length - 1].month;
    return first === last ? first : `${first} — ${last}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-20"
      data-ocid="teaching_plan.page"
    >
      {/* Page Header */}
      <div className="flex items-start gap-3 no-print">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Teaching Plan Generator
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            शिक्षण योजना निर्माता — Rajasthan Government Holidays Integrated
          </p>
        </div>
        {generated && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="ml-auto gap-2"
            data-ocid="teaching_plan.reset_button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Plan
          </Button>
        )}
      </div>

      {/* FORM CARD */}
      <Card
        className="border-border shadow-sm no-print"
        data-ocid="teaching_plan.form.card"
      >
        <CardHeader
          className="pb-2 cursor-pointer select-none"
          onClick={() => generated && setFormCollapsed((v) => !v)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="text-primary">📋</span>
              Input Details / विवरण दर्ज करें
            </CardTitle>
            {generated && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={formCollapsed ? "Expand form" : "Collapse form"}
              >
                {formCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {!formCollapsed && (
            <motion.div
              key="form-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="pt-0 space-y-5">
                {/* Row 1: teacher name + batch name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Teacher Name / शिक्षक का नाम
                    </Label>
                    <Input
                      value={formData.teacherName}
                      readOnly
                      className="bg-muted/50 text-sm"
                      data-ocid="teaching_plan.teacher_name.input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Batch / Admission Year (बैच वर्ष)
                    </Label>
                    <Input
                      value={formData.batchName}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          batchName: e.target.value,
                        }))
                      }
                      placeholder="e.g. 2024-27"
                      className="text-sm"
                      data-ocid="teaching_plan.batch_name.input"
                    />
                  </div>
                </div>

                {/* Row 2: semester + subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Class / Semester (कक्षा / सेमेस्टर)
                    </Label>
                    <Select
                      value={formData.semesterId}
                      onValueChange={(v) => {
                        setFormData((p) => ({
                          ...p,
                          semesterId: v,
                          subjectId: "",
                        }));
                        setErrors((e) => ({ ...e, semesterId: undefined }));
                      }}
                    >
                      <SelectTrigger
                        className="text-sm"
                        data-ocid="teaching_plan.semester.select"
                      >
                        <SelectValue placeholder="Select Class/Semester..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allSemesters.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.semesterId && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="teaching_plan.semester.error_state"
                      >
                        {errors.semesterId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Subject & Paper Code (विषय और पेपर कोड)
                    </Label>
                    {filteredSubjects.length > 0 ? (
                      <Select
                        value={formData.subjectId}
                        onValueChange={(v) => {
                          handleSubjectChange(v);
                          setErrors((e) => ({ ...e, subjectId: undefined }));
                        }}
                      >
                        <SelectTrigger
                          className="text-sm"
                          data-ocid="teaching_plan.subject.select"
                        >
                          <SelectValue placeholder="Select Subject..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSubjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.code} — {s.name} ({s.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.subjectId}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            subjectId: e.target.value,
                          }))
                        }
                        placeholder="Enter subject code / name"
                        className="text-sm"
                        data-ocid="teaching_plan.subject.input"
                      />
                    )}
                    {errors.subjectId && (
                      <p
                        className="text-xs text-destructive"
                        data-ocid="teaching_plan.subject.error_state"
                      >
                        {errors.subjectId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 3: paper type + total classes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Paper Type (पेपर प्रकार)
                    </Label>
                    <Select
                      value={formData.paperType}
                      onValueChange={(v) =>
                        setFormData((p) => ({ ...p, paperType: v }))
                      }
                    >
                      <SelectTrigger
                        className="text-sm"
                        data-ocid="teaching_plan.paper_type.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Theory">Theory / सिद्धांत</SelectItem>
                        <SelectItem value="Practical">
                          Practical / प्रयोगात्मक
                        </SelectItem>
                        <SelectItem value="Tutorial">
                          Tutorial / ट्यूटोरियल
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Total Allocated Classes (कुल आवंटित कक्षाएं)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={formData.totalClasses}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          totalClasses: Math.max(
                            1,
                            Math.min(200, Number(e.target.value)),
                          ),
                        }))
                      }
                      className="text-sm"
                      data-ocid="teaching_plan.total_classes.input"
                    />
                    {errors.totalClasses && (
                      <p className="text-xs text-destructive">
                        {errors.totalClasses}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 4: start date + academic year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Start Date (प्रारंभ तिथि)
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          startDate: e.target.value,
                        }))
                      }
                      className="text-sm"
                      data-ocid="teaching_plan.start_date.input"
                    />
                    {errors.startDate && (
                      <p className="text-xs text-destructive">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Academic Year (शैक्षणिक वर्ष)
                    </Label>
                    <Input
                      value={formData.academicYear}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          academicYear: e.target.value,
                        }))
                      }
                      placeholder="e.g. 2026-27"
                      className="text-sm"
                      data-ocid="teaching_plan.academic_year.input"
                    />
                  </div>
                </div>

                {/* Working days */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Working Days (कार्य दिवस) —{" "}
                    <span className="text-amber-600 font-medium">
                      2nd Saturday skipped automatically / दूसरा शनिवार स्वतः छोड़ा
                      जाएगा
                    </span>
                  </Label>
                  <div
                    className="flex flex-wrap gap-3"
                    data-ocid="teaching_plan.working_days.panel"
                  >
                    {WORKING_DAYS.map((d) => (
                      <label
                        key={d.value}
                        htmlFor={`day-check-${d.value}`}
                        className="flex items-center gap-1.5 cursor-pointer select-none group"
                      >
                        <Checkbox
                          id={`day-check-${d.value}`}
                          checked={formData.selectedDays.includes(d.value)}
                          onCheckedChange={() => handleDayToggle(d.value)}
                          className="data-[state=checked]:bg-primary"
                          data-ocid={`teaching_plan.day_${d.label.toLowerCase()}.checkbox`}
                        />
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {d.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({d.labelHi})
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.selectedDays && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="teaching_plan.working_days.error_state"
                    >
                      {errors.selectedDays}
                    </p>
                  )}
                </div>

                {/* Holiday Set */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Holiday Set (अवकाश सूची)
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {(
                      [
                        {
                          value: "2026",
                          label: "Rajasthan State Holidays 2026",
                          labelHi: "राजस्थान राज्य अवकाश 2026",
                        },
                        {
                          value: "2025",
                          label: "Rajasthan State Holidays 2025",
                          labelHi: "राजस्थान राज्य अवकाश 2025",
                        },
                        {
                          value: "none",
                          label: "No Holidays",
                          labelHi: "कोई अवकाश नहीं",
                        },
                      ] as const
                    ).map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="holidaySet"
                          value={opt.value}
                          checked={formData.holidaySet === opt.value}
                          onChange={() =>
                            setFormData((p) => ({
                              ...p,
                              holidaySet: opt.value,
                            }))
                          }
                          className="accent-primary"
                          data-ocid={`teaching_plan.holiday_${opt.value}.radio`}
                        />
                        <span className="text-sm">{opt.label}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          / {opt.labelHi}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  className="w-full h-11 text-base font-semibold gap-2 bg-[oklch(0.265_0.075_243)] hover:bg-[oklch(0.22_0.075_243)] text-white"
                  data-ocid="teaching_plan.generate_button"
                >
                  🚀 Teaching Plan तैयार करें / Generate Teaching Plan
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* OUTPUT SECTION */}
      <AnimatePresence>
        {generated && schedule.length > 0 && (
          <motion.div
            key="output"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* Stats Summary */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 no-print"
              data-ocid="teaching_plan.stats.panel"
            >
              {[
                {
                  label: "Total Classes / कुल कक्षाएं",
                  value: schedule.length,
                  color: "text-primary",
                },
                {
                  label: "Holidays Skipped / अवकाश छोड़े",
                  value: holidaysSkipped,
                  color: "text-amber-600",
                },
                {
                  label: "Working Days / कार्य दिवस",
                  value: workingDayLabels,
                  color: "text-teal-600",
                },
                {
                  label: "Month Range / माह सीमा",
                  value: monthRange,
                  color: "text-purple-600",
                },
              ].map((stat) => (
                <Card key={stat.label} className="border-border shadow-sm">
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {stat.label}
                    </p>
                    <p
                      className={`text-lg font-bold mt-0.5 ${stat.color} truncate`}
                    >
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Print Area */}
            <div id="teaching-plan-print-area" ref={printAreaRef}>
              {/* Summary Header */}
              <Card className="border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-foreground print:text-black">
                        Teaching Plan — शिक्षण योजना
                      </h2>
                      <p className="text-xs text-muted-foreground print:text-gray-700">
                        Teacher: <strong>{formData.teacherName}</strong> |
                        Class: <strong>{selectedSemesterName || "—"}</strong> |
                        Batch: <strong>{formData.batchName || "—"}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground print:text-gray-700">
                        Subject: <strong>{selectedSubjectLabel || "—"}</strong>{" "}
                        | Academic Year:{" "}
                        <strong>{formData.academicYear}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground print:text-gray-700">
                        Paper Type: <strong>{formData.paperType}</strong> |
                        Total Classes: <strong>{formData.totalClasses}</strong>{" "}
                        | Working Days: <strong>{workingDayLabels}</strong>
                      </p>
                    </div>

                    <div className="flex gap-2 no-print">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="gap-1.5 text-xs"
                        data-ocid="teaching_plan.print_button"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print / प्रिंट
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                        className="gap-1.5 text-xs text-green-700 border-green-300 hover:bg-green-50"
                        data-ocid="teaching_plan.export_button"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Excel Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Table */}
              <div
                className="overflow-x-auto rounded-xl border border-border shadow-sm mt-4"
                data-ocid="teaching_plan.table"
              >
                <table
                  className="w-full border-collapse text-sm"
                  style={{ tableLayout: "fixed" }}
                >
                  <colgroup>
                    <col style={{ width: "52px" }} />
                    <col style={{ width: "80px" }} />
                    <col style={{ width: "96px" }} />
                    <col style={{ width: "100px" }} />
                    <col />
                  </colgroup>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "oklch(0.265 0.075 243)",
                        color: "white",
                      }}
                    >
                      {[
                        "S.No.",
                        "Batch / बैच",
                        "Date / तिथि",
                        "Day / दिन",
                        "Proposed Topic / प्रस्तावित विषय",
                      ].map((h) => (
                        <th
                          key={h}
                          className="py-2.5 px-3 text-left font-semibold text-[11px] tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthGroups.map((row, index) => (
                      <>
                        {row.isNewMonth && (
                          <tr
                            key={`month-${row.monthKey}`}
                            className="bg-blue-50 print:bg-blue-50"
                          >
                            <td
                              colSpan={5}
                              className="py-1.5 px-3 text-center text-xs font-bold text-blue-700 tracking-wider uppercase border-y border-blue-200"
                            >
                              {row.month}
                            </td>
                          </tr>
                        )}
                        <tr
                          key={row.sno}
                          className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                            index % 2 === 0 ? "bg-background" : "bg-muted/20"
                          }`}
                          data-ocid={`teaching_plan.item.${row.sno}`}
                        >
                          <td className="py-2 px-3 text-right text-xs text-muted-foreground font-mono">
                            {row.sno}
                          </td>
                          <td className="py-2 px-3 text-xs">{row.batch}</td>
                          <td className="py-2 px-3 text-xs font-mono">
                            {row.date}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border ${
                                DAY_COLORS[row.day] ??
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {row.day.slice(0, 3)}
                            </span>
                          </td>
                          <td className="py-1.5 px-2">
                            <input
                              type="text"
                              value={row.topic}
                              onChange={(e) =>
                                handleTopicChange(index, e.target.value)
                              }
                              className="w-full bg-transparent border-0 border-b border-dashed border-border/70 focus:outline-none focus:border-primary text-sm py-0.5 px-1 placeholder:text-muted-foreground/50"
                              placeholder="Enter topic here..."
                              data-ocid={`teaching_plan.topic.${row.sno}`}
                            />
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer for print */}
              <div className="mt-4 hidden print:block text-xs text-gray-500 text-center">
                Generated by FTMS — Faculty &amp; Timetable Management System |
                Rajasthan
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holiday reference card */}
      {!generated && (
        <Card className="border-border/50 shadow-sm bg-muted/30 no-print">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <span>🏛️</span> Rajasthan Govt. Holidays 2026 Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(HOLIDAY_NAMES_2026).map(([date, name]) => (
                <Badge
                  key={date}
                  variant="outline"
                  className="text-[10px] text-muted-foreground"
                >
                  {date.slice(5).replace("-", "/")} {name}
                </Badge>
              ))}
              {Object.entries(HOLIDAY_NAMES_2025)
                .slice(0, 5)
                .map(([date, name]) => (
                  <Badge
                    key={`2025-${date}`}
                    variant="outline"
                    className="text-[10px] text-muted-foreground opacity-50"
                  >
                    (2025) {date.slice(5).replace("-", "/")} {name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
