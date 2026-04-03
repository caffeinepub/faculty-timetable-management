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
import { AlertTriangle, FileText, Plus, Send, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import {
  RATE_PER_HOUR,
  TDS_THRESHOLD,
  useBillingStore,
} from "../../store/useBillingStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { FacultyProfile } from "../../types/models";

interface BillSubmissionProps {
  profile: FacultyProfile;
}

export function BillSubmission({ profile }: BillSubmissionProps) {
  const {
    getBillsByTeacher,
    addBill,
    updateBillStatus,
    deleteBill,
    calculateMonthlyEarnings,
  } = useBillingStore();
  const { subjects, batches } = useTimetableStore();
  const [addOpen, setAddOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [subjectId, setSubjectId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [hours, setHours] = useState("1");

  const myBills = getBillsByTeacher(profile.id);
  const today = new Date();
  const monthlyEarnings = calculateMonthlyEarnings(
    profile.id,
    today.getFullYear(),
    today.getMonth() + 1,
  );
  const tdsApplied = monthlyEarnings.gross > TDS_THRESHOLD;

  const handleAddBill = () => {
    if (!date || !subjectId || !batchId || !hours) {
      toast.error("Please fill all required fields");
      return;
    }
    const hoursTaught = Number(hours);
    const totalAmount = hoursTaught * RATE_PER_HOUR;
    addBill({
      teacherId: profile.id,
      date,
      subjectId,
      batchId,
      hoursTaught,
      ratePerHour: RATE_PER_HOUR,
      totalAmount,
      status: "Draft",
    });
    setAddOpen(false);
    setDate(new Date().toISOString().split("T")[0]);
    setSubjectId("");
    setBatchId("");
    setHours("1");
    toast.success("बिल ड्राफ्ट बनाया / Bill created as draft");
  };

  const handleSubmit = (id: string) => {
    updateBillStatus(id, "Submitted");
    toast.success("बिल जमा किया / Bill submitted");
  };

  const handleDelete = (id: string) => {
    deleteBill(id);
    toast.success("बिल हटाया / Bill deleted");
  };

  const sortedBills = [...myBills].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="bill_submission.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">बिल जमा करें / Bill Submission</h2>
          <p className="text-xs text-muted-foreground">
            Rate: ₹{RATE_PER_HOUR}/hour
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          data-ocid="bill_submission.primary_button"
        >
          <Plus className="w-4 h-4 mr-1" /> नया बिल / New Bill
        </Button>
      </div>

      {/* Monthly earnings summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Gross Earned",
            labelHi: "अर्जित",
            value: `₹${monthlyEarnings.gross.toLocaleString("en-IN")}`,
            color: "text-green-600",
          },
          {
            label: "TDS Deducted",
            labelHi: "टीडीएस",
            value: tdsApplied
              ? `₹${monthlyEarnings.tds.toLocaleString("en-IN")}`
              : "Nil",
            color: "text-destructive",
          },
          {
            label: "Net Payable",
            labelHi: "नेट देय",
            value: `₹${monthlyEarnings.net.toLocaleString("en-IN")}`,
            color: "text-foreground",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border shadow-xs">
            <CardContent className="p-4">
              <div className={`text-xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs font-medium text-foreground">
                {stat.label}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {stat.labelHi}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tdsApplied && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-xs text-red-700">
            टीडीएस 10% लागू (मासिक आय ₹45,000 से अधिक) / TDS 10% applied (monthly
            income exceeds ₹45,000)
          </p>
        </div>
      )}

      {/* Bills table */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            मेरे बिल / My Bills
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table data-ocid="bill_submission.table">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBills.map((bill, i) => {
                const subject = subjects.find((s) => s.id === bill.subjectId);
                return (
                  <TableRow
                    key={bill.id}
                    data-ocid={`bill_submission.row.${i + 1}`}
                  >
                    <TableCell className="text-sm">
                      {new Date(bill.date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {subject?.code ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {bill.hoursTaught}h
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      ₹{bill.totalAmount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <BillStatusBadge status={bill.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {bill.status === "Draft" && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleSubmit(bill.id)}
                              data-ocid={`bill_submission.submit_button.${i + 1}`}
                            >
                              <Send className="w-3 h-3 mr-1" /> Submit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-destructive"
                              onClick={() => handleDelete(bill.id)}
                              data-ocid={`bill_submission.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {bill.checkerComment && (
                          <span
                            className="text-[10px] text-muted-foreground max-w-32 truncate"
                            title={bill.checkerComment}
                          >
                            "{bill.checkerComment.slice(0, 20)}..."
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedBills.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground text-sm py-8"
                    data-ocid="bill_submission.empty_state"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    कोई बिल नहीं / No bills yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add bill dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="bill_add.dialog">
          <DialogHeader>
            <DialogTitle>नया कक्षा बिल / New Class Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">तारीख / Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
                data-ocid="bill_add.date.input"
              />
            </div>
            <div>
              <Label className="text-xs">विषय / Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger
                  className="mt-1"
                  data-ocid="bill_add.subject.select"
                >
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">समूह / Batch</Label>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">घंटे / Hours Taught</Label>
              <Input
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="mt-1"
                data-ocid="bill_add.hours.input"
              />
            </div>
            <div className="bg-secondary rounded-lg p-3 text-sm">
              <span className="text-muted-foreground">Total:</span>{" "}
              <strong>
                ₹{(Number(hours) * RATE_PER_HOUR).toLocaleString("en-IN")}
              </strong>
              <span className="text-muted-foreground text-xs ml-2">
                ({hours}h × ₹{RATE_PER_HOUR})
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="bill_add.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleAddBill} data-ocid="bill_add.submit_button">
              ड्राफ्ट बनाएं / Save Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
