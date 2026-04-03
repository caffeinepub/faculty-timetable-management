import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Clock, FileText } from "lucide-react";
import { motion } from "motion/react";
import { BillStatusBadge } from "../../components/BillStatusBadge";
import { useBillingStore } from "../../store/useBillingStore";
import { useFacultyStore } from "../../store/useFacultyStore";

export function CheckerDashboard() {
  const { bills } = useBillingStore();
  const { getFacultyById } = useFacultyStore();

  const submittedBills = bills
    .filter((b) => b.status === "Submitted")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const allPending = bills.filter(
    (b) => b.status === "Submitted" || b.status === "Checked",
  );
  const checkedToday = bills.filter((b) => {
    if (b.status !== "Checked") return false;
    const today = new Date().toISOString().split("T")[0];
    return b.checkedAt?.startsWith(today);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="checker_dashboard.page"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Pending Review",
            labelHi: "समीक्षा लंबित",
            value: submittedBills.length,
            icon: <Clock className="w-5 h-5" />,
            color: "text-amber-600 bg-amber-100",
          },
          {
            label: "Total Pending",
            labelHi: "कुल लंबित",
            value: allPending.length,
            icon: <FileText className="w-5 h-5" />,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Checked Today",
            labelHi: "आज जांचे",
            value: checkedToday.length,
            icon: <ClipboardCheck className="w-5 h-5" />,
            color: "text-green-600 bg-green-100",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-border shadow-card">
              <CardContent className="p-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-sm font-semibold">{stat.label}</div>
                <div className="text-[10px] text-muted-foreground">
                  {stat.labelHi}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Submitted bills */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              समीक्षा के लिए बिल / Bills Awaiting Review
            </CardTitle>
            {submittedBills.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {submittedBills.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2" data-ocid="checker_bills.list">
          {submittedBills.map((bill, i) => {
            const teacher = getFacultyById(bill.teacherId);
            return (
              <div
                key={bill.id}
                className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
                data-ocid={`checker_bills.item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {teacher?.name ?? "Unknown"}
                    </p>
                    <BillStatusBadge status={bill.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(bill.date).toLocaleDateString("en-IN")} &bull;{" "}
                    {bill.hoursTaught}h &bull; ₹
                    {bill.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    ₹{bill.totalAmount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(bill.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>
            );
          })}
          {submittedBills.length === 0 && (
            <div
              className="text-center py-10 text-muted-foreground"
              data-ocid="checker_bills.empty_state"
            >
              <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                समीक्षा के लिए कोई बिल नहीं / No bills awaiting review
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
