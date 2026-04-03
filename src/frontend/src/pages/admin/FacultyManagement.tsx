import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Shield,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigation } from "../../App";
import { useBankStore } from "../../store/useBankStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import type { FacultyProfile } from "../../types/models";

export function FacultyManagement() {
  const { navigate } = useNavigation();
  const { faculty, updateFaculty, setEarningLimits } = useFacultyStore();
  const { getBankDetailsByFaculty } = useBankStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [limitsDialog, setLimitsDialog] = useState<FacultyProfile | null>(null);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [yearlyLimit, setYearlyLimit] = useState("");

  const teachers = faculty.filter((f) => f.role !== "admin");

  const handleApprove = (id: string) => {
    updateFaculty(id, { approvalStatus: "approved" });
    toast.success("शिक्षक अनुमोदित / Faculty approved");
  };

  const handleReject = (id: string) => {
    updateFaculty(id, { approvalStatus: "rejected" });
    toast.error("शिक्षक अस्वीकृत / Faculty rejected");
  };

  const handleSetRole = (id: string, role: "teacher" | "checker") => {
    updateFaculty(id, { role });
    toast.success("भूमिका अपडेट / Role updated");
  };

  const handleSaveLimits = () => {
    if (!limitsDialog) return;
    setEarningLimits(limitsDialog.id, {
      monthlyLimit: monthlyLimit ? Number(monthlyLimit) : undefined,
      yearlyLimit: yearlyLimit ? Number(yearlyLimit) : undefined,
    });
    setLimitsDialog(null);
    toast.success("सीमा अपडेट / Limits updated");
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const statusColor = {
    approved: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="faculty_management.page"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold">
              शिक्षक प्रबंधन / Faculty Management
            </h2>
            <p className="text-xs text-muted-foreground">
              {teachers.length} faculty members
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/admin/faculty/register")}
          data-ocid="faculty_management.register_button"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Register Faculty / पंजीकरण करें
        </Button>
      </div>

      <div className="space-y-3" data-ocid="faculty_management.list">
        {teachers.map((member, idx) => {
          const bank = getBankDetailsByFaculty(member.id);
          const isExpanded = expandedId === member.id;
          return (
            <Card
              key={member.id}
              className="border-border shadow-xs"
              data-ocid={`faculty_management.item.${idx + 1}`}
            >
              <button
                type="button"
                className="w-full flex items-center gap-4 p-4 cursor-pointer text-left"
                onClick={() => setExpandedId(isExpanded ? null : member.id)}
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {member.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusColor[member.approvalStatus]}`}
                    >
                      {member.approvalStatus}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.email} &bull; {member.department}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.approvalStatus === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(member.id);
                        }}
                        data-ocid={`faculty_management.approve_button.${idx + 1}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(member.id);
                        }}
                        data-ocid={`faculty_management.delete_button.${idx + 1}`}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Details */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-foreground">
                          Phone:
                        </span>{" "}
                        {member.phone}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          Qualifications:
                        </span>{" "}
                        {member.qualifications}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          Designation:
                        </span>{" "}
                        {member.designation}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          Monthly Limit:
                        </span>{" "}
                        {member.monthlyLimit
                          ? `₹${member.monthlyLimit.toLocaleString("en-IN")}`
                          : "Not set"}
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          Yearly Limit:
                        </span>{" "}
                        {member.yearlyLimit
                          ? `₹${member.yearlyLimit.toLocaleString("en-IN")}`
                          : "Not set"}
                      </div>
                    </div>

                    {/* Bank details */}
                    {bank && (
                      <div className="bg-secondary rounded-lg p-3 text-xs space-y-1">
                        <p className="font-semibold text-foreground mb-1">
                          बैंक जानकारी / Bank Details
                        </p>
                        <div>
                          <span className="text-muted-foreground">Bank:</span>{" "}
                          {bank.bankName}
                        </div>
                        <div>
                          <span className="text-muted-foreground">IFSC:</span>{" "}
                          {bank.ifscCode}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Account:
                          </span>{" "}
                          ****{bank.accountNumber.slice(-4)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">PAN:</span>{" "}
                          {bank.panNumber.slice(0, 3)}***
                          {bank.panNumber.slice(-2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        setLimitsDialog(member);
                        setMonthlyLimit(member.monthlyLimit?.toString() ?? "");
                        setYearlyLimit(member.yearlyLimit?.toString() ?? "");
                      }}
                      data-ocid={`faculty_management.edit_button.${idx + 1}`}
                    >
                      <Wallet className="w-3 h-3 mr-1" /> Set Earning Limits
                    </Button>
                    <Select
                      value={member.role}
                      onValueChange={(v) =>
                        handleSetRole(member.id, v as "teacher" | "checker")
                      }
                    >
                      <SelectTrigger className="h-7 text-xs w-36">
                        <Shield className="w-3 h-3 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="checker">Checker</SelectItem>
                      </SelectContent>
                    </Select>
                    {member.approvalStatus === "approved" && (
                      <Badge className="bg-green-100 text-green-700 border border-green-200 text-[10px]">
                        <UserCheck className="w-3 h-3 mr-1" /> Approved
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Edit3 className="w-3 h-3 mr-1" /> Edit Profile
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {teachers.length === 0 && (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="faculty_management.empty_state"
          >
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No faculty members found</p>
          </div>
        )}
      </div>

      {/* Limits dialog */}
      <Dialog open={!!limitsDialog} onOpenChange={() => setLimitsDialog(null)}>
        <DialogContent data-ocid="faculty_limits.dialog">
          <DialogHeader>
            <DialogTitle>सीमा निर्धारित करें / Set Earning Limits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">मासिक सीमा / Monthly Limit (₹)</Label>
              <Input
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="e.g. 50000"
                className="mt-1"
                data-ocid="faculty_limits.monthly.input"
              />
            </div>
            <div>
              <Label className="text-xs">वार्षिक सीमा / Yearly Limit (₹)</Label>
              <Input
                type="number"
                value={yearlyLimit}
                onChange={(e) => setYearlyLimit(e.target.value)}
                placeholder="e.g. 600000"
                className="mt-1"
                data-ocid="faculty_limits.yearly.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLimitsDialog(null)}
              data-ocid="faculty_limits.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLimits}
              data-ocid="faculty_limits.save_button"
            >
              Save / सहेजें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
