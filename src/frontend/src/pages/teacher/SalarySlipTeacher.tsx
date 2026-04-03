import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useBillingStore } from "../../store/useBillingStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import type { FacultyProfile } from "../../types/models";

interface SalarySlipTeacherProps {
  profile: FacultyProfile;
}

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

export function SalarySlipTeacher({ profile }: SalarySlipTeacherProps) {
  const { calculateMonthlyEarnings, bills } = useBillingStore();
  const { settings } = useSettingsStore();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Generate last 12 months
  const months = useMemo(() => {
    const result: {
      year: number;
      month: number;
      label: string;
      key: string;
    }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
        key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      });
    }
    return result;
  }, []);

  // Only show months with at least 1 approved bill
  const monthsWithBills = useMemo(() => {
    return months.filter((m) => {
      const approvedBills = bills.filter((b) => {
        if (b.teacherId !== profile.id || b.status !== "Approved") return false;
        const d = new Date(b.date);
        return d.getFullYear() === m.year && d.getMonth() + 1 === m.month;
      });
      return approvedBills.length > 0;
    });
  }, [months, bills, profile.id]);

  const selected = months.find((m) => m.key === selectedKey);
  const earnings = useMemo(() => {
    if (!selected) return null;
    return calculateMonthlyEarnings(profile.id, selected.year, selected.month);
  }, [selected, profile.id, calculateMonthlyEarnings]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
      data-ocid="salary_slip_teacher.page"
    >
      <style>{`
        @media print {
          body > * { display: none !important; }
          #teacher-salary-slip-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        #teacher-salary-slip-print { display: contents; }
      `}</style>

      <div className="flex items-center gap-3 no-print">
        <Receipt className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">मेरी वेतन पर्ची / My Salary Slips</h2>
          <p className="text-xs text-muted-foreground">
            View and print monthly salary slips
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 no-print">
        {/* Month selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Select Month / माह चुनें
          </p>
          {monthsWithBills.length === 0 && (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="salary_slip_teacher.empty_state"
            >
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No approved bills yet</p>
              <p className="text-xs mt-1">अभी कोई स्वीकृत बिल नहीं</p>
            </div>
          )}
          {monthsWithBills.map((m, i) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setSelectedKey(m.key)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                selectedKey === m.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:bg-secondary"
              }`}
              data-ocid={`salary_slip_teacher.item.${i + 1}`}
            >
              <span className="text-sm font-semibold">{m.label}</span>
            </button>
          ))}
          {monthsWithBills.length > 0 && !selectedKey && (
            <p className="text-xs text-muted-foreground">
              Click a month to preview slip
            </p>
          )}
        </div>

        {/* Slip */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="flex items-center justify-center h-full min-h-64 text-muted-foreground">
              <div className="text-center">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Select a month to view salary slip</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-3">
                <Badge
                  variant="outline"
                  className="mr-auto text-xs text-muted-foreground"
                >
                  {earnings?.bills.length ?? 0} approved bills
                </Badge>
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-2"
                  data-ocid="salary_slip_teacher.print.button"
                >
                  <Printer className="w-4 h-4" /> Print
                </Button>
              </div>
              <div id="teacher-salary-slip-print">
                <Card className="border-2 border-border shadow-card">
                  <CardContent className="p-6">
                    <div className="text-center border-b-2 border-foreground pb-4 mb-4">
                      <h1 className="text-xl font-extrabold">
                        {settings.institutionName}
                      </h1>
                      <p className="text-xs text-muted-foreground">
                        {settings.institutionNameHindi}
                      </p>
                      <div className="mt-3 inline-block bg-foreground text-background px-6 py-1.5 rounded">
                        <span className="text-base font-bold tracking-widest">
                          SALARY SLIP / वेतन पर्ची
                        </span>
                      </div>
                      <p className="text-sm font-semibold mt-2">
                        {selected.label}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-5 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Employee Name / नाम:
                        </span>
                        <p className="font-semibold">{profile.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Department / विभाग:
                        </span>
                        <p className="font-semibold">
                          {profile.department ?? "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Designation / पदनाम:
                        </span>
                        <p className="font-semibold">
                          {profile.designation ?? "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Pay Period / भुगतान अवधि:
                        </span>
                        <p className="font-semibold">{selected.label}</p>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden mb-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left p-3 font-semibold text-xs uppercase">
                              Description / विवरण
                            </th>
                            <th className="text-right p-3 font-semibold text-xs uppercase">
                              Amount / राशि (₹)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-border">
                            <td className="p-3">
                              <div className="font-medium">
                                Basic Wages / मूल वेतन
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {earnings?.bills.reduce(
                                  (s, b) => s + b.hoursTaught,
                                  0,
                                ) ?? 0}
                                h × ₹{settings.ratePerHour}/hr
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
                                  TDS Deduction / टीडीएस
                                </div>
                                <div className="text-xs text-red-600">
                                  {settings.tdsRate * 100}%
                                </div>
                              </td>
                              <td className="p-3 text-right font-semibold text-red-700">
                                − ₹
                                {(earnings?.tds ?? 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          )}
                          <tr className="border-t-2 border-foreground bg-muted">
                            <td className="p-3 font-bold">
                              Net Payable / शुद्ध देय
                            </td>
                            <td className="p-3 text-right text-xl font-extrabold">
                              ₹{(earnings?.net ?? 0).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="border-b border-foreground mb-2 pb-6" />
                        <p className="text-xs font-semibold">Admin Signature</p>
                      </div>
                      <div className="text-center">
                        <div className="border-b border-foreground mb-2 pb-6" />
                        <p className="text-xs font-semibold">Accounts / लेखा</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
