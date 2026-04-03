import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Eye,
  Layers,
  Plus,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useFacultyStore } from "../../store/useFacultyStore";
import {
  type FacultyReview,
  type ReviewCycle,
  usePerformanceStore,
} from "../../store/usePerformanceStore";

function ScoreBadge({ score }: { score: number }) {
  if (score >= 8)
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        {score} / Excellent
      </Badge>
    );
  if (score >= 5)
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
        {score} / Good
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-700 border-red-200">
      {score} / Needs Improvement
    </Badge>
  );
}

const SCORE_FIELDS: { key: keyof FacultyReview["scores"]; label: string }[] = [
  { key: "teaching", label: "Teaching Quality" },
  { key: "punctuality", label: "Punctuality" },
  { key: "research", label: "Research" },
  { key: "studentFeedback", label: "Student Feedback" },
  { key: "administrativeDuties", label: "Admin Duties" },
];

export function PerformanceReview() {
  const {
    cycles,
    reviews,
    addCycle,
    updateCycle,
    deleteCycle,
    addReview,
    updateReview,
    deleteReview,
    getReviewsByCycle,
  } = usePerformanceStore();
  const { faculty } = useFacultyStore();

  const teachers = useMemo(
    () => faculty.filter((f) => f.role === "teacher"),
    [faculty],
  );

  // Cycle dialog
  const [cycleDialog, setCycleDialog] = useState(false);
  const [editingCycle, setEditingCycle] = useState<ReviewCycle | null>(null);
  const [cycleForm, setCycleForm] = useState({
    title: "",
    year: new Date().getFullYear(),
    semester: "odd" as "odd" | "even",
    startDate: "",
    endDate: "",
    status: "Active" as "Active" | "Closed",
  });

  // Review dialog
  const [reviewDialog, setReviewDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<FacultyReview | null>(
    null,
  );
  const [reviewForm, setReviewForm] = useState<{
    cycleId: string;
    teacherId: string;
    teacherName: string;
    scores: FacultyReview["scores"];
    remarks: string;
  }>({
    cycleId: "",
    teacherId: "",
    teacherName: "",
    scores: {
      teaching: 7,
      punctuality: 7,
      research: 7,
      studentFeedback: 7,
      administrativeDuties: 7,
    },
    remarks: "",
  });

  // Filters
  const [filterCycle, setFilterCycle] = useState("all");
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [deleteCycleId, setDeleteCycleId] = useState<string | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [viewCycleId, setViewCycleId] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filterCycle !== "all" && r.cycleId !== filterCycle) return false;
      if (filterTeacher !== "all" && r.teacherId !== filterTeacher)
        return false;
      return true;
    });
  }, [reviews, filterCycle, filterTeacher]);

  const openAddCycle = () => {
    setEditingCycle(null);
    setCycleForm({
      title: "",
      year: new Date().getFullYear(),
      semester: "odd",
      startDate: "",
      endDate: "",
      status: "Active",
    });
    setCycleDialog(true);
  };

  const openEditCycle = (c: ReviewCycle) => {
    setEditingCycle(c);
    setCycleForm({
      title: c.title,
      year: c.year,
      semester: c.semester,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
    });
    setCycleDialog(true);
  };

  const saveCycle = () => {
    if (!cycleForm.title || !cycleForm.startDate || !cycleForm.endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editingCycle) {
      updateCycle(editingCycle.id, cycleForm);
      toast.success("Review cycle updated");
    } else {
      addCycle(cycleForm);
      toast.success("Review cycle created");
    }
    setCycleDialog(false);
  };

  const openAddReview = (cycleId?: string) => {
    setEditingReview(null);
    setReviewForm({
      cycleId: cycleId ?? cycles[0]?.id ?? "",
      teacherId: "",
      teacherName: "",
      scores: {
        teaching: 7,
        punctuality: 7,
        research: 7,
        studentFeedback: 7,
        administrativeDuties: 7,
      },
      remarks: "",
    });
    setReviewDialog(true);
  };

  const openEditReview = (r: FacultyReview) => {
    setEditingReview(r);
    setReviewForm({
      cycleId: r.cycleId,
      teacherId: r.teacherId,
      teacherName: r.teacherName,
      scores: { ...r.scores },
      remarks: r.remarks,
    });
    setReviewDialog(true);
  };

  const saveReview = () => {
    if (!reviewForm.cycleId || !reviewForm.teacherId) {
      toast.error("Please select cycle and teacher");
      return;
    }
    if (editingReview) {
      updateReview(editingReview.id, {
        ...reviewForm,
        reviewedBy: "admin",
        reviewedAt: new Date().toISOString(),
      });
      toast.success("Review updated");
    } else {
      addReview({
        ...reviewForm,
        reviewedBy: "admin",
        reviewedAt: new Date().toISOString(),
      });
      toast.success("Review added");
    }
    setReviewDialog(false);
  };

  const exportCSV = () => {
    const header = [
      "Teacher",
      "Cycle",
      "Teaching",
      "Punctuality",
      "Research",
      "Student Feedback",
      "Admin Duties",
      "Overall",
      "Remarks",
    ];
    const rows = filteredReviews.map((r) => [
      r.teacherName,
      cycles.find((c) => c.id === r.cycleId)?.title ?? r.cycleId,
      r.scores.teaching,
      r.scores.punctuality,
      r.scores.research,
      r.scores.studentFeedback,
      r.scores.administrativeDuties,
      r.overallScore,
      r.remarks,
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "performance_reviews.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const kpi = useMemo(() => {
    const active = cycles.filter((c) => c.status === "Active").length;
    const avg =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((s, r) => s + r.overallScore, 0) / reviews.length) *
              10,
          ) / 10
        : 0;
    return { total: cycles.length, active, totalReviews: reviews.length, avg };
  }, [cycles, reviews]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="performance_review.page"
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Cycles",
            labelHindi: "कुल चक्र",
            value: kpi.total,
            icon: <Layers className="w-5 h-5" />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Active Cycles",
            labelHindi: "सक्रिय चक्र",
            value: kpi.active,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Total Reviews",
            labelHindi: "कुल समीक्षाएं",
            value: kpi.totalReviews,
            icon: <Star className="w-5 h-5" />,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Average Score",
            labelHindi: "औसत अंक",
            value: `${kpi.avg} / 10`,
            icon: <Users className="w-5 h-5" />,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}
                  >
                    {k.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-[10px] text-muted-foreground/60">
                  {k.labelHindi}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="cycles" data-ocid="performance_review.tab">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="cycles">Review Cycles / चक्र</TabsTrigger>
            <TabsTrigger value="reviews">Faculty Reviews / समीक्षाएं</TabsTrigger>
          </TabsList>
          <Button
            onClick={openAddCycle}
            size="sm"
            className="gap-2"
            data-ocid="performance_review.add_cycle.button"
          >
            <Plus className="w-4 h-4" /> New Cycle
          </Button>
        </div>

        {/* Cycles Tab */}
        <TabsContent value="cycles" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="performance_review.cycles.empty_state"
                      >
                        No review cycles. Create one above.
                      </TableCell>
                    </TableRow>
                  )}
                  {cycles.map((c, idx) => (
                    <TableRow
                      key={c.id}
                      data-ocid={`performance_review.cycle.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{c.year}</TableCell>
                      <TableCell className="capitalize">{c.semester}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.startDate} → {c.endDate}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            c.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getReviewsByCycle(c.id).length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setViewCycleId(c.id);
                              setFilterCycle(c.id);
                            }}
                            data-ocid={`performance_review.view_reviews.button.${idx + 1}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditCycle(c)}
                            data-ocid={`performance_review.edit_cycle.button.${idx + 1}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteCycleId(c.id)}
                            className="text-destructive hover:text-destructive"
                            data-ocid={`performance_review.delete_cycle.button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterCycle} onValueChange={setFilterCycle}>
              <SelectTrigger
                className="w-48"
                data-ocid="performance_review.filter_cycle.select"
              >
                <SelectValue placeholder="Filter by cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cycles</SelectItem>
                {cycles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger
                className="w-48"
                data-ocid="performance_review.filter_teacher.select"
              >
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={exportCSV}
              data-ocid="performance_review.export.button"
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => openAddReview(viewCycleId ?? undefined)}
              data-ocid="performance_review.add_review.button"
            >
              <Plus className="w-4 h-4" /> Add Review
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead className="text-center">Teaching</TableHead>
                    <TableHead className="text-center">Punctuality</TableHead>
                    <TableHead className="text-center">Research</TableHead>
                    <TableHead className="text-center">Feedback</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Overall</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-muted-foreground py-8"
                        data-ocid="performance_review.reviews.empty_state"
                      >
                        No reviews found. Add a review above.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredReviews.map((r, idx) => (
                    <TableRow
                      key={r.id}
                      data-ocid={`performance_review.review.item.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {r.teacherName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {cycles.find((c) => c.id === r.cycleId)?.title ??
                          r.cycleId}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.scores.teaching}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.scores.punctuality}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.scores.research}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.scores.studentFeedback}
                      </TableCell>
                      <TableCell className="text-center">
                        {r.scores.administrativeDuties}
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreBadge score={r.overallScore} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditReview(r)}
                            data-ocid={`performance_review.edit_review.button.${idx + 1}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteReviewId(r.id)}
                            className="text-destructive hover:text-destructive"
                            data-ocid={`performance_review.delete_review.button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cycle Dialog */}
      <Dialog open={cycleDialog} onOpenChange={setCycleDialog}>
        <DialogContent data-ocid="performance_review.cycle.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingCycle ? "Edit Review Cycle" : "New Review Cycle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input
                value={cycleForm.title}
                onChange={(e) =>
                  setCycleForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Annual Review 2026 (Odd Semester)"
                data-ocid="performance_review.cycle_title.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Year *</Label>
                <Input
                  type="number"
                  value={cycleForm.year}
                  onChange={(e) =>
                    setCycleForm((f) => ({
                      ...f,
                      year: Number(e.target.value),
                    }))
                  }
                  data-ocid="performance_review.cycle_year.input"
                />
              </div>
              <div>
                <Label>Semester *</Label>
                <Select
                  value={cycleForm.semester}
                  onValueChange={(v: "odd" | "even") =>
                    setCycleForm((f) => ({ ...f, semester: v }))
                  }
                >
                  <SelectTrigger data-ocid="performance_review.cycle_semester.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="odd">Odd</SelectItem>
                    <SelectItem value="even">Even</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={cycleForm.startDate}
                  onChange={(e) =>
                    setCycleForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  data-ocid="performance_review.cycle_start.input"
                />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={cycleForm.endDate}
                  onChange={(e) =>
                    setCycleForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  data-ocid="performance_review.cycle_end.input"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={cycleForm.status}
                onValueChange={(v: "Active" | "Closed") =>
                  setCycleForm((f) => ({ ...f, status: v }))
                }
              >
                <SelectTrigger data-ocid="performance_review.cycle_status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCycleDialog(false)}
              data-ocid="performance_review.cycle_cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCycle}
              data-ocid="performance_review.cycle_save.button"
            >
              {editingCycle ? "Update" : "Create"} Cycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent
          className="max-w-lg"
          data-ocid="performance_review.review.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingReview ? "Edit Review" : "Add Faculty Review"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Review Cycle *</Label>
                <Select
                  value={reviewForm.cycleId}
                  onValueChange={(v) =>
                    setReviewForm((f) => ({ ...f, cycleId: v }))
                  }
                >
                  <SelectTrigger data-ocid="performance_review.review_cycle.select">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Teacher *</Label>
                <Select
                  value={reviewForm.teacherId}
                  onValueChange={(v) => {
                    const t = teachers.find((t) => t.id === v);
                    setReviewForm((f) => ({
                      ...f,
                      teacherId: v,
                      teacherName: t?.name ?? v,
                    }));
                  }}
                >
                  <SelectTrigger data-ocid="performance_review.review_teacher.select">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="cred_teacher1">
                      Dr. Ramesh Sharma
                    </SelectItem>
                    <SelectItem value="cred_teacher2">
                      Prof. Sunita Verma
                    </SelectItem>
                    <SelectItem value="cred_teacher3">
                      Mr. Anil Meena
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Score sliders */}
            {SCORE_FIELDS.map((f) => (
              <div key={f.key}>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm">{f.label}</Label>
                  <span className="text-sm font-bold text-primary">
                    {reviewForm.scores[f.key]} / 10
                  </span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[reviewForm.scores[f.key]]}
                  onValueChange={([val]) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      scores: { ...prev.scores, [f.key]: val },
                    }))
                  }
                  data-ocid={`performance_review.score_${f.key}.input`}
                />
              </div>
            ))}

            <div>
              <Label>Remarks</Label>
              <Textarea
                value={reviewForm.remarks}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, remarks: e.target.value }))
                }
                rows={2}
                placeholder="Optional remarks..."
                data-ocid="performance_review.review_remarks.textarea"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Auto-computed Overall:{" "}
              <strong>
                {Math.round(
                  (Object.values(reviewForm.scores).reduce((a, b) => a + b, 0) /
                    5) *
                    10,
                ) / 10}{" "}
                / 10
              </strong>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog(false)}
              data-ocid="performance_review.review_cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveReview}
              data-ocid="performance_review.review_save.button"
            >
              {editingReview ? "Update" : "Add"} Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Cycle Confirmation */}
      <AlertDialog
        open={!!deleteCycleId}
        onOpenChange={() => setDeleteCycleId(null)}
      >
        <AlertDialogContent data-ocid="performance_review.delete_cycle.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the review cycle and all its reviews.
              / यह समीक्षा चक्र और सभी समीक्षाएं स्थायी रूप से हट जाएंगी।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="performance_review.delete_cycle.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteCycleId) {
                  deleteCycle(deleteCycleId);
                  setDeleteCycleId(null);
                  toast.success("Cycle deleted");
                }
              }}
              data-ocid="performance_review.delete_cycle.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Review Confirmation */}
      <AlertDialog
        open={!!deleteReviewId}
        onOpenChange={() => setDeleteReviewId(null)}
      >
        <AlertDialogContent data-ocid="performance_review.delete_review.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this performance review. / यह समीक्षा
              स्थायी रूप से हट जाएगी।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="performance_review.delete_review.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteReviewId) {
                  deleteReview(deleteReviewId);
                  setDeleteReviewId(null);
                  toast.success("Review deleted");
                }
              }}
              data-ocid="performance_review.delete_review.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
