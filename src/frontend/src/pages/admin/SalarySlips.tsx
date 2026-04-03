import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useSettingsStore } from "../../store/useSettingsStore";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = [2024, 2025, 2026];

export function SalarySlips() {
  const { getApprovedTeachers } = useFacultyStore();
  const { calculateMonthlyEarnings } = useBillingStore();
  const { settings } = useSettingsStore();

  const teachers = getApprovedTeachers();
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const teacher = useMemo(
    () => teachers.find((t) => t.id === selectedTeacherId) ?? null,
    [teachers, selectedTeacherId],
  );

  const earnings = useMemo(() => {
    if (!selectedTeacherId || !selectedMonth || !selectedYear) return null;
    return calculateMonthlyEarnings(
      selectedTeacherId,
      Number(selectedYear),
      Number(selectedMonth),
    );
  }, [
    selectedTeacherId,
    selectedMonth,
    selectedYear,
    calculateMonthlyEarnings,
  ]);

  const monthLabel = selectedMonth
    ? MONTH_NAMES[Number(selectedMonth) - 1]
    : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 max-w-3xl"
      data-ocid="salary_slips.page"
    >
      <style>{`
        @media print {
          body > * { display: none !important; }
          #salary-slip-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        #salary-slip-print { display: contents; }
      `}</style>

      <div className="flex items-center gap-3 no-print">
        <Receipt className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">वेतन पर्ची / Salary Slips</h2>
          <p className="text-xs text-muted-foreground">
            Generate and print monthly salary slips for faculty
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 no-print">
        <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
          <SelectTrigger
            className="w-56"
            data-ocid="salary_slips.teacher.select"
          >
            <SelectValue placeholder="Select faculty..." />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40" data-ocid="salary_slips.month.select">
            <SelectValue placeholder="Month..." />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((m, i) => (
              <SelectItem key={m} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-28" data-ocid="salary_slips.year.select">
            <SelectValue placeholder="Year..." />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {teacher && selectedMonth && selectedYear && (
          <Button
            onClick={() => window.print()}
            className="gap-2"
            data-ocid="salary_slips.print.button"
          >
            <Printer className="w-4 h-4" />
            Print / Print करें
          </Button>
        )}
      </div>

      {/* Slip preview */}
      {!teacher || !selectedMonth || !selectedYear ? (
        <div
          className="py-16 text-center text-muted-foreground no-print"
          data-ocid="salary_slips.empty_state"
        >
          <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            Select faculty, month, and year to generate a salary slip
          </p>
          <p className="text-xs mt-1">शिक्षक, माह और वर्ष चुनें</p>
        </div>
      ) : (
        <div id="salary-slip-print">
          <Card className="border-2 border-border shadow-card">
            <CardContent className="p-6">
              {/* Header */}
              <div className="text-center border-b-2 border-foreground pb-4 mb-4">
                <h1 className="text-xl font-extrabold tracking-wide text-foreground">
                  {settings.institutionName}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settings.institutionNameHindi}
                </p>
                {settings.address && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {settings.address}
                  </p>
                )}
                <div className="mt-3 inline-block bg-foreground text-background px-6 py-1.5 rounded">
                  <span className="text-base font-bold tracking-widest">
                    SALARY SLIP / वेतन पर्ची
                  </span>
                </div>
                <p className="text-sm font-semibold mt-2">
                  {monthLabel} {selectedYear}
                </p>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-5 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">
                    Employee Name / नाम:
                  </span>
                  <p className="font-semibold">{teacher.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Employee ID / आईडी:
                  </span>
                  <p className="font-semibold font-mono text-xs mt-0.5">
                    {teacher.id}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Department / विभाग:
                  </span>
                  <p className="font-semibold">{teacher.department ?? "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Designation / पदनाम:
                  </span>
                  <p className="font-semibold">{teacher.designation ?? "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Pay Period / भुगतान अवधि:
                  </span>
                  <p className="font-semibold">
                    {monthLabel} {selectedYear}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">
                    Academic Year / शैक्षणिक वर्ष:
                  </span>
                  <p className="font-semibold">{settings.academicYear}</p>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="border border-border rounded-lg overflow-hidden mb-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-3 font-semibold text-xs uppercase tracking-wide">
                        Description / विवरण
                      </th>
                      <th className="text-right p-3 font-semibold text-xs uppercase tracking-wide">
                        Amount / राशि (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-3">
                        <div className="font-medium">Basic Wages / मूल वेतन</div>
                        <div className="text-xs text-muted-foreground">
                          {earnings?.bills.reduce(
                            (s, b) => s + b.hoursTaught,
                            0,
                          ) ?? 0}{" "}
                          hours &nbsp;×&nbsp;₹{settings.ratePerHour}/hr
                        </div>
                      </td>
                      <td className="p-3 text-right font-semibold">
                        ₹{(earnings?.gross ?? 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                    {(earnings?.tds ?? 0) > 0 && (
                      <tr className="border-t border-border bg-red-50">
                        <td className="p-3">
                          <div className="font-medium text-red-700">
                            TDS Deduction / टीडीएस कटौती
                          </div>
                          <div className="text-xs text-red-600">
                            {settings.tdsRate * 100}% (Gross &gt; ₹
                            {settings.tdsThreshold.toLocaleString("en-IN")})
                          </div>
                        </td>
                        <td className="p-3 text-right font-semibold text-red-700">
                          − ₹{(earnings?.tds ?? 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-foreground bg-muted">
                      <td className="p-3 font-bold">Net Payable / शुद्ध देय</td>
                      <td className="p-3 text-right text-xl font-extrabold">
                        ₹{(earnings?.net ?? 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bills count note */}
              {earnings && earnings.bills.length > 0 && (
                <p className="text-xs text-muted-foreground mb-5">
                  Based on {earnings.bills.length} approved bill
                  {earnings.bills.length > 1 ? "s" : ""} for {monthLabel}{" "}
                  {selectedYear}. &nbsp;{earnings.bills.length} स्वीकृत बिल के आधार
                  पर।
                </p>
              )}
              {earnings && earnings.bills.length === 0 && (
                <p className="text-xs text-amber-600 mb-5">
                  No approved bills found for this period. / इस अवधि के लिए कोई
                  स्वीकृत बिल नहीं मिला।
                </p>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="border-b border-foreground mb-2 pb-8" />
                  <p className="text-xs font-semibold">
                    Admin Signature / प्रशासक हस्ताक्षर
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {settings.institutionName}
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-b border-foreground mb-2 pb-8" />
                  <p className="text-xs font-semibold">Accounts / लेखा विभाग</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Verified &amp; Authorized
                  </p>
                </div>
              </div>

              <p className="text-[9px] text-muted-foreground text-center mt-4">
                This is a computer-generated salary slip and does not require a
                physical signature. &nbsp; यह एक कंप्यूटर जनित वेतन पर्ची है।
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
