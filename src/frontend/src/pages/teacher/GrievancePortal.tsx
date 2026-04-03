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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  MessageSquare as MessageSquareIcon,
  Plus as PlusIcon,
  XCircle as XCircleIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGrievanceStore } from "../../store/useGrievanceStore";
import type { FacultyProfile, Grievance } from "../../types/models";

interface GrievancePortalProps {
  profile: FacultyProfile;
}

function statusBadge(status: Grievance["status"]) {
  switch (status) {
    case "Open":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0">
          Open / खुला
        </Badge>
      );
    case "Under Review":
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0">
          Under Review / समीक्षाधीन
        </Badge>
      );
    case "Resolved":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-0">
          Resolved / समाधानित
        </Badge>
      );
    case "Rejected":
      return <Badge variant="destructive">Rejected / अस्वीकृत</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function priorityBadge(priority: Grievance["priority"]) {
  if (priority === "High")
    return <span className="text-xs text-destructive font-medium">▲ High</span>;
  if (priority === "Medium")
    return <span className="text-xs text-amber-500 font-medium">► Medium</span>;
  return <span className="text-xs text-muted-foreground">▼ Low</span>;
}

export function GrievancePortal({ profile }: GrievancePortalProps) {
  const { addGrievance, getGrievancesByTeacher } = useGrievanceStore();

  const myGrievances = useMemo(
    () => getGrievancesByTeacher(profile.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile.id, getGrievancesByTeacher],
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "Other" as Grievance["category"],
    priority: "Medium" as Grievance["priority"],
    description: "",
  });
  const [descError, setDescError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title / शीर्षक अनिवार्य है");
      return;
    }
    if (form.description.trim().length < 20) {
      setDescError("विवरण / Description must be at least 20 characters");
      return;
    }
    setDescError("");

    addGrievance({
      teacherId: profile.id,
      teacherName: profile.name,
      title: form.title,
      category: form.category,
      priority: form.priority,
      description: form.description,
    });

    toast.success("शिकायत दर्ज की गई / Grievance submitted successfully");
    setForm({
      title: "",
      category: "Other",
      priority: "Medium",
      description: "",
    });
    setIsDialogOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="grievance.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grievance Portal</h1>
          <p className="text-sm text-muted-foreground">
            शिकायत पोर्टल | Submit and track your grievances
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          data-ocid="grievance.submit_button"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> New Grievance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: myGrievances.length,
            icon: <MessageSquareIcon className="w-5 h-5" />,
            color: "text-primary",
          },
          {
            label: "Open",
            value: myGrievances.filter((g) => g.status === "Open").length,
            icon: <ClockIcon className="w-5 h-5" />,
            color: "text-blue-500",
          },
          {
            label: "Resolved",
            value: myGrievances.filter((g) => g.status === "Resolved").length,
            icon: <CheckCircleIcon className="w-5 h-5" />,
            color: "text-green-500",
          },
          {
            label: "Rejected",
            value: myGrievances.filter((g) => g.status === "Rejected").length,
            icon: <XCircleIcon className="w-5 h-5" />,
            color: "text-destructive",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-card">
            <CardContent className="pt-6 pb-4">
              <div className={`mb-2 ${s.color}`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grievances List */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            मेरी शिकायतें / My Grievances
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myGrievances.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3"
              data-ocid="grievance.empty_state"
            >
              <MessageSquareIcon className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">
                No grievances submitted yet / अभी कोई शिकायत नहीं
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                Submit your first grievance
              </Button>
            </div>
          ) : (
            <Table data-ocid="grievance.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myGrievances.map((g, i) => (
                  <>
                    <TableRow
                      key={g.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedId(expandedId === g.id ? null : g.id)
                      }
                      data-ocid={`grievance.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{g.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{g.category}</Badge>
                      </TableCell>
                      <TableCell>{priorityBadge(g.priority)}</TableCell>
                      <TableCell>{statusBadge(g.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(g.submittedAt).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {g.adminResponse ? (
                          <span className="text-green-600 text-xs">
                            ✓ Responded
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === g.id && (
                      <TableRow key={`${g.id}-detail`}>
                        <TableCell colSpan={6}>
                          <div className="py-3 px-2 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                विवरण / Description
                              </p>
                              <p className="text-sm mt-1">{g.description}</p>
                            </div>
                            {g.adminResponse && (
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                                  विभाग प्रतिक्रिया / Admin Response
                                </p>
                                <p className="text-sm text-green-800 dark:text-green-300">
                                  {g.adminResponse}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Submit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="grievance.dialog">
          <DialogHeader>
            <DialogTitle>नई शिकायत / Submit New Grievance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>शीर्षक / Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Brief title of your concern"
                data-ocid="grievance.title.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>श्रेणी / Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      category: v as Grievance["category"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="grievance.category.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Salary",
                      "Leave",
                      "Workload",
                      "Conduct",
                      "Facility",
                      "Other",
                    ].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>अग्राधिकता / Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      priority: v as Grievance["priority"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="grievance.priority.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>विवरण / Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => {
                  setForm((p) => ({ ...p, description: e.target.value }));
                  if (e.target.value.length >= 20) setDescError("");
                }}
                placeholder="Describe your concern in detail (minimum 20 characters)"
                rows={5}
                data-ocid="grievance.description.textarea"
              />
              {descError && (
                <p
                  className="text-xs text-destructive mt-1"
                  data-ocid="grievance.description.error_state"
                >
                  {descError}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {form.description.length} / 20 min characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-ocid="grievance.dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              data-ocid="grievance.dialog.submit_button"
            >
              <AlertTriangleIcon className="w-4 h-4 mr-2" /> Submit Grievance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
