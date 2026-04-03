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
import { Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { RATE_PER_HOUR, calcTds } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { FacultyProfile } from "../../types/models";

interface FacultyInvoiceProps {
  profile?: FacultyProfile;
}

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const HINDI_MONTHS: Record<string, string> = {
  "1": "जनवरी",
  "2": "फरवरी",
  "3": "मार्च",
  "4": "अप्रैल",
  "5": "मई",
  "6": "जून",
  "7": "जुलाई",
  "8": "अगस्त",
  "9": "सितम्बर",
  "10": "अक्टूबर",
  "11": "नवम्बर",
  "12": "दिसम्बर",
};

function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function FacultyInvoice({ profile }: FacultyInvoiceProps) {
  const { getApprovedTeachers, getFacultyById } = useFacultyStore();
  const { subjects } = useTimetableStore();
  const { settings } = useSettingsStore();

  // Import bills directly from localStorage to avoid circular hook deps
  const [rawBills] = (() => {
    try {
      const stored = localStorage.getItem("ftms_bills");
      return [stored ? JSON.parse(stored) : []];
    } catch {
      return [[]];
    }
  })();

  const approvedTeachers = getApprovedTeachers();
  const now = new Date();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    profile?.id ?? approvedTeachers[0]?.id ?? "",
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(now.getMonth() + 1),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(now.getFullYear()),
  );
  const [courseInput, setCourseInput] = useState<string>("BCA I Semester");
  const [timeInput, setTimeInput] = useState<string>("9:00-10:00 AM");

  const teacherId = profile ? profile.id : selectedTeacherId;
  const teacher = profile ?? getFacultyById(teacherId);

  // All approved bills for the selected teacher + month + year (ALL subjects — consolidated)
  const filteredBills = useMemo(() => {
    return (
      rawBills as Array<{
        id: string;
        teacherId: string;
        date: string;
        hoursTaught: number;
        ratePerHour: number;
        totalAmount: number;
        status: string;
        subjectId?: string;
      }>
    )
      .filter((b) => {
        if (b.teacherId !== teacherId) return false;
        if (b.status !== "Approved") return false;
        const d = new Date(b.date);
        return (
          d.getFullYear() === Number(selectedYear) &&
          d.getMonth() + 1 === Number(selectedMonth)
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [rawBills, teacherId, selectedMonth, selectedYear]);

  // Collect all unique subjects from the filtered bills for the header summary
  const uniqueSubjectsSummary = useMemo(() => {
    const ids = [
      ...new Set(filteredBills.map((b) => b.subjectId).filter(Boolean)),
    ];
    return ids
      .map((id) => subjects.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => `${s!.code} — ${s!.name}`);
  }, [filteredBills, subjects]);

  // Group bills by ISO week
  const weekGroups = useMemo(() => {
    const groups: Map<number, typeof filteredBills> = new Map();
    for (const bill of filteredBills) {
      const week = getISOWeek(new Date(bill.date));
      if (!groups.has(week)) groups.set(week, []);
      groups.get(week)!.push(bill);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [filteredBills]);

  const totalPeriods = filteredBills.reduce((sum, b) => sum + b.hoursTaught, 0);
  const rate = settings.ratePerHour ?? RATE_PER_HOUR;
  const grossAmount = totalPeriods * rate;
  const tdsAmount = calcTds(grossAmount);
  const netAmount = grossAmount - tdsAmount;

  const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label ?? "";
  const hindiMonthLabel = HINDI_MONTHS[selectedMonth] ?? "";
  const department = teacher?.department ?? "Computer Science";

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body > * { display: none !important; }
          #faculty-invoice-print {
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: white;
          }
          .no-print { display: none !important; }
        }
        #faculty-invoice-print { display: contents; }
      `}</style>

      {/* Filter Controls — NOT printed */}
      <div className="no-print bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Invoice Filters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {!profile && (
            <div className="space-y-1">
              <Label htmlFor="faculty-select">Faculty</Label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger id="faculty-select" data-ocid="invoice.select">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {approvedTeachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="month-select">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month-select" data-ocid="invoice.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="year-select">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year-select" data-ocid="invoice.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="course-input">Class / Course</Label>
            <Input
              id="course-input"
              data-ocid="invoice.input"
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              placeholder="e.g. MCA I Semester"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="time-input">Time Slot</Label>
            <Input
              id="time-input"
              data-ocid="invoice.input"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="e.g. 9:00-10:00 AM"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => window.print()}
              className="w-full"
              data-ocid="invoice.primary_button"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredBills.length === 0 && (
        <div
          className="no-print flex flex-col items-center justify-center py-16 text-center"
          data-ocid="invoice.empty_state"
        >
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-700">
            No Approved Bills Found
          </h3>
          <p className="text-gray-500 mt-1 text-sm">
            No approved bills found for {teacher?.name ?? "selected teacher"} in{" "}
            {monthLabel} {selectedYear}.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Bills must have status &quot;Approved&quot; to appear on the
            invoice.
          </p>
        </div>
      )}

      {/* ===================== PRINT AREA ===================== */}
      {filteredBills.length > 0 && (
        <div id="faculty-invoice-print" className="bg-white">
          {/* ===== PAGE 1 — CLASS BILL ===== */}
          <div
            style={{ pageBreakAfter: "always" }}
            className="p-8 max-w-4xl mx-auto font-sans text-black"
          >
            {/* Header */}
            <div className="text-center mb-4 border-b-2 border-black pb-3">
              <div className="text-sm font-bold uppercase tracking-wide">
                DEPARTMENT OF COMPUTER SCIENCE
              </div>
              <div className="text-base font-bold uppercase mt-0.5">
                {settings.institutionName}
              </div>
              <div className="text-sm">
                Academic Year: {settings.academicYear}
              </div>
              <div className="text-lg font-bold uppercase mt-2 underline">
                ATTENDANCE CLASS BILL
              </div>
            </div>

            {/* Info Table */}
            <table
              className="w-full mb-4 text-sm"
              style={{ borderCollapse: "collapse" }}
            >
              <tbody>
                <tr>
                  <td className="py-1 pr-2 font-semibold w-48">
                    Name of Teacher:
                  </td>
                  <td className="py-1 border-b border-black w-64">
                    {teacher?.name ?? "—"}
                  </td>
                  <td className="py-1 px-4 font-semibold w-48">
                    Subject(s) &amp; Paper Codes:
                  </td>
                  <td className="py-1 border-b border-black">
                    {uniqueSubjectsSummary.length > 0
                      ? uniqueSubjectsSummary.join(", ")
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 font-semibold">Course:</td>
                  <td className="py-1 border-b border-black">
                    {courseInput || "—"}
                  </td>
                  <td className="py-1 px-4 font-semibold">Month &amp; Year:</td>
                  <td className="py-1 border-b border-black">
                    {monthLabel} {selectedYear}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 pr-2 font-semibold">Department:</td>
                  <td className="py-1 border-b border-black">{department}</td>
                  <td className="py-1 px-4 font-semibold">Designation:</td>
                  <td className="py-1 border-b border-black">
                    {teacher?.designation ?? "Guest Faculty"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Main Periods Table */}
            <table
              className="w-full text-sm mb-4"
              style={{ borderCollapse: "collapse", border: "1px solid black" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e8e8e8" }}>
                  <th
                    style={{
                      border: "1px solid black",
                      padding: "6px 8px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Sr No.
                  </th>
                  <th
                    style={{
                      border: "1px solid black",
                      padding: "6px 8px",
                      textAlign: "left",
                      minWidth: "220px",
                    }}
                  >
                    Type / Subject
                  </th>
                  <th
                    style={{
                      border: "1px solid black",
                      padding: "6px 8px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Day
                  </th>
                  <th
                    style={{
                      border: "1px solid black",
                      padding: "6px 8px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      border: "1px solid black",
                      padding: "6px 8px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Time
                  </th>
                  <th
                    style={{
                      border: "1px solid black",
                      padding: "6px 8px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    No. of Periods
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let srNo = 0;
                  const rows: React.ReactNode[] = [];
                  for (const [, bills] of weekGroups) {
                    const weekTotal = bills.reduce(
                      (s, b) => s + b.hoursTaught,
                      0,
                    );
                    for (const bill of bills) {
                      srNo++;
                      const d = new Date(bill.date);
                      const dayName = d.toLocaleDateString("en-US", {
                        weekday: "long",
                      });
                      const dateStr = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                      const subj = subjects.find(
                        (s) => s.id === bill.subjectId,
                      );
                      // Type column: "Theory — CS-101 Introduction to Programming"
                      const billType = subj
                        ? `${subj.type ?? "Theory"} — ${subj.code} ${subj.name}`
                        : "Theory";
                      rows.push(
                        <tr key={bill.id}>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "5px 8px",
                              textAlign: "center",
                            }}
                          >
                            {srNo}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "5px 8px",
                              textAlign: "left",
                              minWidth: "220px",
                            }}
                          >
                            {billType}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "5px 8px",
                              textAlign: "center",
                            }}
                          >
                            {dayName}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "5px 8px",
                              textAlign: "center",
                            }}
                          >
                            {dateStr}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "5px 8px",
                              textAlign: "center",
                            }}
                          >
                            {timeInput}
                          </td>
                          <td
                            style={{
                              border: "1px solid black",
                              padding: "5px 8px",
                              textAlign: "center",
                            }}
                          >
                            {bill.hoursTaught}
                          </td>
                        </tr>,
                      );
                    }
                    // Weekly subtotal
                    rows.push(
                      <tr
                        key={`week-total-${bills[0]?.id}`}
                        style={{ backgroundColor: "#f5f5f5" }}
                      >
                        <td
                          colSpan={5}
                          style={{
                            border: "1px solid black",
                            padding: "5px 8px",
                            textAlign: "right",
                            fontWeight: "bold",
                          }}
                        >
                          Total Periods in this week
                        </td>
                        <td
                          style={{
                            border: "1px solid black",
                            padding: "5px 8px",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {weekTotal}
                        </td>
                      </tr>,
                    );
                  }
                  return rows;
                })()}

                {/* Monthly total */}
                <tr style={{ backgroundColor: "#d4e6f1" }}>
                  <td
                    colSpan={5}
                    style={{
                      border: "1px solid black",
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    Total Periods in this month: {filteredBills.length} days
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "6px 8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {totalPeriods}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount Summary */}
            <div className="mb-4 text-sm space-y-1">
              <p>
                <strong>(A)</strong> Amount payable per period @ Rs {rate}/-
                &nbsp;&nbsp;
                <strong>
                  Total amount claimed: Rs.{" "}
                  {grossAmount.toLocaleString("en-IN")}/-
                </strong>
              </p>
              <p>
                <strong>(B)</strong> TDS deducted @ 10% = Rs.{" "}
                {tdsAmount.toLocaleString("en-IN")}/-
              </p>
              <p className="text-base font-bold">
                Net Payable Amount (A - B) = Rs.{" "}
                {netAmount.toLocaleString("en-IN")}/-
              </p>
            </div>

            {/* Undertaking */}
            <div className="text-sm mb-6 border border-black p-3 rounded">
              <p className="font-semibold mb-1">Undertaking / शपथ पत्र:</p>
              <p>
                I hereby declare that the above information is correct and that
                I have not received any remuneration exceeding Rs. 45,000/- per
                month from all sources during the month of{" "}
                <strong>
                  {monthLabel} {selectedYear}
                </strong>
                .
              </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between mt-8 text-sm">
              <div className="text-center">
                <div className="border-t border-black pt-2 w-48">
                  Signature of Teacher
                  <br />
                  <span className="text-xs text-gray-600">
                    ({teacher?.name ?? "—"})
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-black pt-2 w-64">
                  Head, Department of Computer Science
                  <br />
                  <span className="text-xs text-gray-600">
                    {settings.institutionName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== PAGE 2 — शपथ-पत्र ===== */}
          <div className="p-8 max-w-4xl mx-auto font-sans text-black">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-1">शपथ–पत्र</h2>
              <p className="text-sm">(Affidavit)</p>
              <div className="border-b-2 border-black mt-3" />
            </div>

            <div className="text-sm leading-relaxed space-y-5">
              <p>
                मैं <strong>{teacher?.name ?? "—"}</strong>, विभाग{" "}
                <strong>{department}</strong> में गेस्ट फैकल्टी के रूप में कार्यरत हूँ।
              </p>

              <p>
                मैंने माह{" "}
                <strong>
                  {hindiMonthLabel} {selectedYear}
                </strong>{" "}
                में कुल मानदेय <strong>₹45,000/-</strong> से अधिक प्राप्त नहीं किया है।
              </p>

              <p>
                I, <strong>{teacher?.name ?? "—"}</strong>, working as Guest
                Faculty in the Department of <strong>{department}</strong>,
                hereby solemnly declare that my total remuneration in{" "}
                <strong>
                  {monthLabel} {selectedYear}
                </strong>{" "}
                has not exceeded Rs. 45,000/- (Forty-Five Thousand Rupees only)
                from all sources.
              </p>

              <p>
                सकल राशि (Gross Amount):{" "}
                <strong>₹{grossAmount.toLocaleString("en-IN")}/-</strong>
                <br />
                TDS (10%):{" "}
                <strong>₹{tdsAmount.toLocaleString("en-IN")}/-</strong>
                <br />
                निवल राशि (Net Payable):{" "}
                <strong>₹{netAmount.toLocaleString("en-IN")}/-</strong>
              </p>
            </div>

            {/* Faculty Signature */}
            <div className="mt-10 flex justify-between text-sm">
              <div>
                <div className="border-t border-black pt-2 w-48 text-center">
                  हस्ताक्षर / Signature
                  <br />
                  नाम: {teacher?.name ?? "—"}
                  <br />
                  दिनांक / Date: ___________
                </div>
              </div>
              <div className="text-right text-xs text-gray-600">
                Place: ___________
                <br />
                Date: ___________
              </div>
            </div>

            {/* Certification box */}
            <div className="mt-8 border border-black p-4 text-sm">
              <p className="font-semibold mb-2">
                यह प्रमाणित किया जाता है / This is to certify:
              </p>
              <p className="leading-relaxed">
                यह प्रमाणित किया जाता है कि उपरोक्त विवरण सही है और विभाग{" "}
                <strong>{department}</strong> के अनुसार ₹45,000/- से अधिक मानदेय
                प्राप्त नहीं किया गया है।
              </p>
              <p className="mt-2 leading-relaxed">
                It is hereby certified that the above information is correct and
                the guest faculty has not received remuneration exceeding Rs.
                45,000/- during{" "}
                <strong>
                  {monthLabel} {selectedYear}
                </strong>{" "}
                as per the records of the department.
              </p>
            </div>

            {/* Course Director Signature */}
            <div className="mt-10 flex justify-end">
              <div className="text-center text-sm">
                <div className="border-t border-black pt-2 w-72">
                  Course Director
                  <br />
                  Informatics &amp; Computational Sciences Programme
                  <br />
                  <span className="text-xs">{settings.institutionName}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-3 border-t border-gray-300 text-center text-xs text-gray-500">
              {settings.institutionName} | {settings.address ?? ""} | Academic
              Year: {settings.academicYear}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
