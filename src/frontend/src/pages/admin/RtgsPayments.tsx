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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, CheckCircle, CreditCard } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useBankStore } from "../../store/useBankStore";
import {
  TDS_RATE,
  TDS_THRESHOLD,
  useBillingStore,
} from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";

export function RtgsPayments() {
  const { bills, updateBillStatus, addPayment } = useBillingStore();
  const { getFacultyById } = useFacultyStore();
  const { getBankDetailsByFaculty } = useBankStore();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );
  const [rtgsRef, setRtgsRef] = useState("");

  // Group approved bills by teacher
  const approvedByTeacher = bills
    .filter((b) => b.status === "Approved")
    .reduce<Record<string, typeof bills>>((acc, bill) => {
      if (!acc[bill.teacherId]) acc[bill.teacherId] = [];
      acc[bill.teacherId].push(bill);
      return acc;
    }, {});

  const teacherPaymentRows = Object.entries(approvedByTeacher).map(
    ([teacherId, teacherBills]) => {
      const gross = teacherBills.reduce((s, b) => s + b.totalAmount, 0);
      const tds = gross > TDS_THRESHOLD ? gross * TDS_RATE : 0;
      const net = gross - tds;
      return { teacherId, bills: teacherBills, gross, tds, net };
    },
  );

  const selectedRow = teacherPaymentRows.find(
    (r) => r.teacherId === selectedTeacherId,
  );
  const selectedTeacher = selectedTeacherId
    ? getFacultyById(selectedTeacherId)
    : null;
  const selectedBank = selectedTeacherId
    ? getBankDetailsByFaculty(selectedTeacherId)
    : null;

  const handleProcessPayment = () => {
    if (!selectedTeacherId || !rtgsRef || !selectedRow) {
      toast.error("Please fill all fields");
      return;
    }
    // Mark bills as processed and add payment
    for (const bill of selectedRow.bills) {
      updateBillStatus(bill.id, "Approved", {});
    }
    addPayment({
      teacherId: selectedTeacherId,
      billIds: selectedRow.bills.map((b) => b.id),
      amount: selectedRow.gross,
      tdsAmount: selectedRow.tds,
      netAmount: selectedRow.net,
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNumber: rtgsRef,
      status: "Processed",
      processedAt: new Date().toISOString(),
    });
    setSelectedTeacherId(null);
    setRtgsRef("");
    toast.success("आरटीजीएस भुगतान प्रक्रियारत / RTGS payment processed");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="rtgs_payments.page"
    >
      <div className="flex items-center gap-3 mb-2">
        <CreditCard className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">आरटीजीएस भुगतान / RTGS Payments</h2>
          <p className="text-xs text-muted-foreground">
            {teacherPaymentRows.length} teachers with approved bills
          </p>
        </div>
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            भुगतान के लिए तैयार / Ready for Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table data-ocid="rtgs.table">
            <TableHeader>
              <TableRow>
                <TableHead>Faculty</TableHead>
                <TableHead>Bills</TableHead>
                <TableHead>Gross (₹)</TableHead>
                <TableHead>TDS (₹)</TableHead>
                <TableHead>Net (₹)</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherPaymentRows.map((row, i) => {
                const teacher = getFacultyById(row.teacherId);
                const bank = getBankDetailsByFaculty(row.teacherId);
                return (
                  <TableRow key={row.teacherId} data-ocid={`rtgs.row.${i + 1}`}>
                    <TableCell className="text-sm font-medium">
                      {teacher?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.bills.length}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.gross.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm text-destructive">
                      {row.tds.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-green-600">
                      {row.net.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      {bank ? (
                        <span className="text-xs text-muted-foreground">
                          {bank.bankName}
                        </span>
                      ) : (
                        <span className="text-xs text-destructive">
                          No bank details
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={!bank}
                        onClick={() => {
                          setSelectedTeacherId(row.teacherId);
                          setRtgsRef("");
                        }}
                        data-ocid={`rtgs.primary_button.${i + 1}`}
                      >
                        <CreditCard className="w-3 h-3 mr-1" /> Process
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {teacherPaymentRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground text-sm py-8"
                    data-ocid="rtgs.empty_state"
                  >
                    No approved bills ready for payment
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RTGS Dialog */}
      <Dialog
        open={!!selectedTeacherId}
        onOpenChange={() => setSelectedTeacherId(null)}
      >
        <DialogContent data-ocid="rtgs_payment.dialog">
          <DialogHeader>
            <DialogTitle>आरटीजीएस भुगतान / Process RTGS Payment</DialogTitle>
          </DialogHeader>
          {selectedTeacher && selectedRow && (
            <div className="space-y-4">
              {/* Bank details */}
              {selectedBank && (
                <div className="bg-secondary rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      बैंक जानकारी / Bank Details
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <span className="text-muted-foreground">
                        Beneficiary:
                      </span>{" "}
                      {selectedTeacher.name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bank:</span>{" "}
                      {selectedBank.bankName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Branch:</span>{" "}
                      {selectedBank.branch}
                    </div>
                    <div>
                      <span className="text-muted-foreground">IFSC:</span>{" "}
                      {selectedBank.ifscCode}
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Account:</span>{" "}
                      {selectedBank.accountNumber}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment summary */}
              <div className="bg-secondary rounded-lg p-3 text-xs">
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-muted-foreground">Gross:</span>{" "}
                    <strong>
                      ₹{selectedRow.gross.toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TDS:</span>{" "}
                    <strong className="text-destructive">
                      ₹{selectedRow.tds.toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Net Payable:</span>{" "}
                    <strong className="text-green-600">
                      ₹{selectedRow.net.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">
                  आरटीजीएस संदर्भ / RTGS Reference Number
                </Label>
                <Input
                  value={rtgsRef}
                  onChange={(e) => setRtgsRef(e.target.value)}
                  placeholder="e.g. RTGS2024031500001"
                  className="mt-1"
                  data-ocid="rtgs_payment.input"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedTeacherId(null)}
              data-ocid="rtgs_payment.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              data-ocid="rtgs_payment.confirm_button"
            >
              <CheckCircle className="w-4 h-4 mr-1" /> भुगतान प्रक्रियारत / Process
              Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
