import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { TDS_RATE, useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useLeaveStore } from "../../store/useLeaveStore";
import type { FacultyProfile } from "../../types/models";

interface FacultyDetailProps {
  facultyId: string;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function FacultyDetail({ facultyId }: FacultyDetailProps) {
  const { getFacultyById, updateFaculty } = useFacultyStore();
  const { bills } = useBillingStore();
  const { getLeavesByTeacher } = useLeaveStore();

  const faculty = getFacultyById(facultyId);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<Partial<FacultyProfile>>({});

  const facultyBills = useMemo(
    () =>
      bills
        .filter((b) => b.teacherId === facultyId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [bills, facultyId],
  );

  const facultyLeaves = useMemo(
    () => getLeavesByTeacher(facultyId),
    [getLeavesByTeacher, facultyId],
  );

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - 5 + i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthBills = bills.filter((b) => {
        if (b.teacherId !== facultyId || b.status !== "Approved") return false;
        const bd = new Date(b.date);
        return bd.getMonth() + 1 === m && bd.getFullYear() === y;
      });
      return {
        month: MONTH_NAMES[m - 1],
        earnings: monthBills.reduce((s, b) => s + b.totalAmount, 0),
      };
    });
  }, [bills, facultyId]);

  const chartConfig = {
    earnings: { label: "Earnings (₹)", color: "hsl(var(--chart-1))" },
  };

  const initials =
    faculty?.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "?";

  if (!faculty) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="faculty_detail.page"
      >
        <p>Faculty not found / शिक्षक नहीं मिला</p>
      </div>
    );
  }

  const openEdit = () => {
    setEditForm({
      name: faculty.name,
      department: faculty.department,
      designation: faculty.designation,
      monthlyLimit: faculty.monthlyLimit,
      yearlyLimit: faculty.yearlyLimit,
    });
    setEditDialog(true);
  };

  const handleSaveEdit = () => {
    updateFaculty(facultyId, editForm);
    toast.success("Faculty updated / शिक्षक अपडेट हुआ");
    setEditDialog(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="faculty_detail.page"
    >
      <Card className="border-border shadow-card">
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-2xl font-bold">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold">{faculty.name}</h2>
                <Badge
                  variant="outline"
                  className={
                    faculty.approvalStatus === "approved"
                      ? "border-green-300 text-green-700"
                      : "border-amber-300 text-amber-700"
                  }
                >
                  {faculty.approvalStatus}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {faculty.designation} &bull; {faculty.department}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {faculty.qualifications}
              </p>
              <div className="flex gap-4 mt-2 flex-wrap">
                <span className="text-xs">📞 {faculty.phone}</span>
                <span className="text-xs">📧 {faculty.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={openEdit}
              data-ocid="faculty_detail.edit_button"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
          </div>
          {(faculty.monthlyLimit || faculty.yearlyLimit) && (
            <div className="mt-4 flex gap-4 pt-4 border-t border-border">
              {faculty.monthlyLimit && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Monthly Limit: </span>
                  <strong>
                    ₹{faculty.monthlyLimit.toLocaleString("en-IN")}
                  </strong>
                </div>
              )}
              {faculty.yearlyLimit && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Yearly Limit: </span>
                  <strong>
                    ₹{faculty.yearlyLimit.toLocaleString("en-IN")}
                  </strong>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="billing" data-ocid="faculty_detail.tab">
        <TabsList>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="leaves">Leave History</TabsTrigger>
          <TabsTrigger value="earnings">Earnings Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="mt-4">
          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table data-ocid="faculty_detail.bills.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyBills.map((bill, i) => (
                    <TableRow
                      key={bill.id}
                      data-ocid={`faculty_detail.bills.item.${i + 1}`}
                    >
                      <TableCell className="text-sm">
                        {new Date(bill.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {bill.hoursTaught}h
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{bill.totalAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${bill.status === "Approved" ? "border-green-300 text-green-700" : bill.status === "Rejected" ? "border-red-300 text-red-700" : "border-amber-300 text-amber-700"}`}
                        >
                          {bill.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {facultyBills.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="faculty_detail.bills.empty_state"
                      >
                        No bills found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="mt-4">
          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table data-ocid="faculty_detail.leaves.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyLeaves.map((leave, i) => (
                    <TableRow
                      key={leave.id}
                      data-ocid={`faculty_detail.leaves.item.${i + 1}`}
                    >
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {leave.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(leave.fromDate).toLocaleDateString("en-IN")}
                        {leave.fromDate !== leave.toDate &&
                          ` — ${new Date(leave.toDate).toLocaleDateString("en-IN")}`}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {leave.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${leave.status === "Approved" ? "border-green-300 text-green-700" : leave.status === "Rejected" ? "border-red-300 text-red-700" : "border-amber-300 text-amber-700"}`}
                        >
                          {leave.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {facultyLeaves.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="faculty_detail.leaves.empty_state"
                      >
                        No leave records
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="mt-4">
          <Card className="border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Last 6 Months Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-56 w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="earnings"
                    fill="var(--color-earnings)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">
                  TDS Rate: {TDS_RATE * 100}% (applied on every bill)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent data-ocid="faculty_detail.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit Faculty / शिक्षक संपादित करें</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name / नाम</Label>
              <Input
                value={editForm.name ?? ""}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-1"
                data-ocid="faculty_detail.edit.name.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Department / विभाग</Label>
                <Input
                  value={editForm.department ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, department: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="faculty_detail.edit.department.input"
                />
              </div>
              <div>
                <Label>Designation / पदनाम</Label>
                <Input
                  value={editForm.designation ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, designation: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="faculty_detail.edit.designation.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Monthly Limit (₹)</Label>
                <Input
                  type="number"
                  value={editForm.monthlyLimit ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      monthlyLimit: Number(e.target.value) || undefined,
                    }))
                  }
                  className="mt-1"
                  data-ocid="faculty_detail.edit.monthly_limit.input"
                />
              </div>
              <div>
                <Label>Yearly Limit (₹)</Label>
                <Input
                  type="number"
                  value={editForm.yearlyLimit ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      yearlyLimit: Number(e.target.value) || undefined,
                    }))
                  }
                  className="mt-1"
                  data-ocid="faculty_detail.edit.yearly_limit.input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog(false)}
              data-ocid="faculty_detail.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              data-ocid="faculty_detail.edit.save_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
