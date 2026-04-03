import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import { useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { DailyClassBill, FacultyProfile } from "../../types/models";

interface BillReviewProps {
  profile: FacultyProfile;
}

export function BillReview({ profile }: BillReviewProps) {
  const { bills, updateBillStatus } = useBillingStore();
  const { getFacultyById } = useFacultyStore();
  const { subjects, batches } = useTimetableStore();
  const [selectedBill, setSelectedBill] = useState<DailyClassBill | null>(null);
  const [comment, setComment] = useState("");

  const submittedBills = bills
    .filter((b) => b.status === "Submitted")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const handleApprove = () => {
    if (!selectedBill) return;
    updateBillStatus(selectedBill.id, "Checked", {
      checkerComment: comment,
      checkedBy: profile.id,
    });
    setSelectedBill(null);
    setComment("");
    toast.success("बिल जांचा गया / Bill checked and forwarded");
  };

  const handleReject = () => {
    if (!selectedBill) return;
    if (!comment) {
      toast.error("अस्वीकृति का कारण दिखाएं / Please provide a rejection reason");
      return;
    }
    updateBillStatus(selectedBill.id, "Rejected", {
      checkerComment: comment,
      checkedBy: profile.id,
    });
    setSelectedBill(null);
    setComment("");
    toast.error("बिल अस्वीकृत / Bill rejected");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="bill_review.page"
    >
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">बिल समीक्षा / Bill Review</h2>
          <p className="text-xs text-muted-foreground">
            {submittedBills.length} bills awaiting verification
          </p>
        </div>
      </div>

      <div className="space-y-3" data-ocid="bill_review.list">
        {submittedBills.map((bill, i) => {
          const teacher = getFacultyById(bill.teacherId);
          const subject = subjects.find((s) => s.id === bill.subjectId);
          const batch = batches.find((b) => b.id === bill.batchId);
          return (
            <Card
              key={bill.id}
              className="border-border shadow-xs"
              data-ocid={`bill_review.item.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        {teacher?.name ?? "Unknown"}
                      </span>
                      <BillStatusBadge status={bill.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(bill.date).toLocaleDateString("en-IN")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {bill.hoursTaught}h @ ₹{bill.ratePerHour}/hr
                      </span>
                    </div>
                    {subject && (
                      <p className="text-xs text-muted-foreground">
                        {subject.code} - {subject.name} &bull; {batch?.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₹{bill.totalAmount.toLocaleString("en-IN")}
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => {
                        setSelectedBill(bill);
                        setComment("");
                      }}
                      data-ocid={`bill_review.edit_button.${i + 1}`}
                    >
                      Review / समीक्षा
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {submittedBills.length === 0 && (
          <Card className="border-border shadow-xs">
            <CardContent
              className="py-12 text-center text-muted-foreground"
              data-ocid="bill_review.empty_state"
            >
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                समीक्षा के लिए कोई बिल नहीं / No bills awaiting review
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent data-ocid="bill_review.dialog">
          <DialogHeader>
            <DialogTitle>बिल सत्यापन / Bill Verification</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-4">
              {/* Bill details */}
              <div className="bg-secondary rounded-lg p-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">शिक्षक:</span>{" "}
                    {getFacultyById(selectedBill.teacherId)?.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">तारीख:</span>{" "}
                    {new Date(selectedBill.date).toLocaleDateString("en-IN")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">घंटे:</span>{" "}
                    {selectedBill.hoursTaught}h
                  </div>
                  <div>
                    <span className="text-muted-foreground">दर:</span> ₹
                    {selectedBill.ratePerHour}/hr
                  </div>
                  <div className="col-span-2 text-base font-bold">
                    कुल / Total: ₹
                    {selectedBill.totalAmount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">
                  टिप्पणी / Comment (required for rejection)
                </Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your verification comment..."
                  className="mt-1 h-24 text-sm"
                  data-ocid="bill_review.comment.textarea"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedBill(null)}
              data-ocid="bill_review.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              data-ocid="bill_review.delete_button"
            >
              <XCircle className="w-4 h-4 mr-1" /> अस्वीकरण / Reject
            </Button>
            <Button
              onClick={handleApprove}
              data-ocid="bill_review.confirm_button"
            >
              <CheckCircle className="w-4 h-4 mr-1" /> सत्यापित / Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
