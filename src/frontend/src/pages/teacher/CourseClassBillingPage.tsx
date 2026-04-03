import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Plus,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  MONTHLY_CLASS_LIMIT,
  useCourseClassStore,
} from "../../store/useCourseClassStore";
import { useCourseStore } from "../../store/useCourseStore";

const MONTHS = [
  { value: "2026-01", label: "January 2026" },
  { value: "2025-12", label: "December 2025" },
  { value: "2025-11", label: "November 2025" },
  { value: "2025-10", label: "October 2025" },
];

const CURRENT_TEACHER_ID = "teacher-1";

export function CourseClassBillingPage() {
  const { entries, addEntry, getMonthlyTotal, getMonthlyLimit, canAddEntry } =
    useCourseClassStore();
  const { courses, getAssignmentsByTeacher } = useCourseStore();

  const myAssignments = getAssignmentsByTeacher(CURRENT_TEACHER_ID);
  const myEntries = entries.filter((e) => e.teacherId === CURRENT_TEACHER_ID);

  const [filterMonth, setFilterMonth] = useState("2026-01");
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({
    assignmentId: "",
    month: "2026-01",
    classesHeld: "",
    ratePerClass: "800",
  });

  const selectedAssignment = myAssignments.find(
    (a) => a.id === form.assignmentId,
  );

  const prospectiveAmount =
    Number(form.classesHeld) * Number(form.ratePerClass);
  const courseId = selectedAssignment
    ? (courses.find(
        (c) =>
          c.name === selectedAssignment.courseId ||
          c.id === selectedAssignment.courseId,
      )?.id ??
      courses[0]?.id ??
      "")
    : "";
  const monthlyLimit = courseId
    ? getMonthlyLimit(courseId)
    : MONTHLY_CLASS_LIMIT;
  const currentTotal = selectedAssignment
    ? getMonthlyTotal(selectedAssignment.className, form.month)
    : 0;
  const wouldExceed = selectedAssignment
    ? !canAddEntry(
        selectedAssignment.className,
        form.month,
        prospectiveAmount,
        courseId,
      )
    : false;

  const handleAdd = () => {
    if (!selectedAssignment) {
      toast.error("Select a class assignment");
      return;
    }
    if (!form.classesHeld || Number(form.classesHeld) <= 0) {
      toast.error("Enter valid number of classes");
      return;
    }
    if (wouldExceed) {
      toast.error(
        `Cannot add: would exceed monthly class limit of ₹${monthlyLimit.toLocaleString()}`,
      );
      return;
    }
    addEntry({
      teacherId: CURRENT_TEACHER_ID,
      courseId: selectedAssignment.courseId,
      className: selectedAssignment.className,
      subjectName: selectedAssignment.subjectName,
      paperCode: selectedAssignment.paperCode,
      month: form.month,
      classesHeld: Number(form.classesHeld),
      ratePerClass: Number(form.ratePerClass),
    });
    toast.success("Class entry added!");
    setDialog(false);
    setForm({
      assignmentId: "",
      month: "2026-01",
      classesHeld: "",
      ratePerClass: "800",
    });
  };

  const filteredEntries = myEntries.filter((e) => e.month === filterMonth);
  const totalGross = filteredEntries.reduce((s, e) => s + e.grossAmount, 0);
  const totalTDS = filteredEntries.reduce((s, e) => s + e.tdsAmount, 0);
  const totalNet = filteredEntries.reduce((s, e) => s + e.netAmount, 0);

  // Per-class usage for current month
  const classUsage = [...new Set(myAssignments.map((a) => a.className))].map(
    (cls) => {
      const course = courses.find((c) => c.name.includes(cls.split(" ")[0]));
      const limit = course ? getMonthlyLimit(course.id) : MONTHLY_CLASS_LIMIT;
      const used = getMonthlyTotal(cls, filterMonth);
      return {
        className: cls,
        used,
        limit,
        pct: Math.min((used / limit) * 100, 100),
      };
    },
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IndianRupee className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Course Class Billing
            </h1>
            <p className="text-gray-500 text-sm">
              Enter class-wise billing. Monthly limit: ₹45,000 per class.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Class Entry
        </Button>
      </div>

      {/* Class Usage Cards */}
      {classUsage.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classUsage.map((cu) => (
            <Card
              key={cu.className}
              className={
                cu.pct >= 100
                  ? "border-red-300"
                  : cu.pct >= 80
                    ? "border-orange-300"
                    : "border-green-200"
              }
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{cu.className}</span>
                  {cu.pct >= 100 ? (
                    <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Limit Reached
                    </Badge>
                  ) : cu.pct >= 80 ? (
                    <Badge className="bg-orange-100 text-orange-700">
                      Near Limit
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Within Limit
                    </Badge>
                  )}
                </div>
                <Progress value={cu.pct} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used: ₹{cu.used.toLocaleString()}</span>
                  <span>Limit: ₹{cu.limit.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Month filter + Summary */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Month:</span>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-44">
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

      {filteredEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-blue-700">
                ₹{totalGross.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600">Gross Amount</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-red-700">
                ₹{totalTDS.toLocaleString()}
              </div>
              <div className="text-xs text-red-600">TDS (10%)</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-green-700">
                ₹{totalNet.toLocaleString()}
              </div>
              <div className="text-xs text-green-600">Net Payable</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Paper Code</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>TDS (10%)</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.className}</TableCell>
                    <TableCell>{e.subjectName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{e.paperCode}</Badge>
                    </TableCell>
                    <TableCell>{e.month}</TableCell>
                    <TableCell>{e.classesHeld}</TableCell>
                    <TableCell className="font-medium">
                      ₹{e.grossAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-600">
                      ₹{e.tdsAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600 font-bold">
                      ₹{e.netAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          e.status === "Approved"
                            ? "text-green-600"
                            : e.status === "Rejected"
                              ? "text-red-600"
                              : "text-orange-600"
                        }
                      >
                        {e.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEntries.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-gray-500 py-8"
                    >
                      No entries for this month
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Class - Subject Assignment</Label>
              <Select
                value={form.assignmentId}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, assignmentId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment" />
                </SelectTrigger>
                <SelectContent>
                  {myAssignments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.className} - {a.subjectName} ({a.paperCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Month</Label>
              <Select
                value={form.month}
                onValueChange={(v) => setForm((p) => ({ ...p, month: v }))}
              >
                <SelectTrigger>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Classes Held</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.classesHeld}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, classesHeld: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Rate per Class (₹)</Label>
                <Input
                  type="number"
                  value={form.ratePerClass}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ratePerClass: e.target.value }))
                  }
                />
              </div>
            </div>
            {form.classesHeld && form.ratePerClass && selectedAssignment && (
              <div
                className={`p-3 rounded-lg space-y-2 ${wouldExceed ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span>Gross Amount:</span>
                  <span className="font-bold">
                    ₹{prospectiveAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Current Month Total (this class):</span>
                  <span>₹{currentTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Monthly Limit:</span>
                  <span>₹{monthlyLimit.toLocaleString()}</span>
                </div>
                {wouldExceed && (
                  <div className="flex items-center gap-2 text-red-600 font-medium">
                    <AlertTriangle className="w-4 h-4" /> This entry would
                    exceed the monthly class limit!
                  </div>
                )}
                {!wouldExceed && (
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-4 h-4" /> Within limit. New total:
                    ₹{(currentTotal + prospectiveAmount).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleAdd}
              disabled={wouldExceed || !form.classesHeld}
            >
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
