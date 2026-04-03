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
  BookOpen as BookOpenIcon,
  Calendar as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Plus as PlusIcon,
  Printer as PrinterIcon,
  Trash2 as TrashIcon,
  XCircle as XCircleIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuditStore } from "../../store/useAuditStore";
import { useExamStore } from "../../store/useExamStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { Exam } from "../../types/models";

const EMPTY_EXAM: Omit<Exam, "id" | "createdAt"> = {
  title: "",
  subjectId: "",
  semesterId: "",
  date: "",
  startTime: "09:00",
  endTime: "11:00",
  roomId: "",
  invigilatorIds: [],
  type: "Internal",
  maxMarks: 50,
  status: "Scheduled",
};

function statusColor(status: Exam["status"]) {
  switch (status) {
    case "Scheduled":
      return "default";
    case "Ongoing":
      return "secondary";
    case "Completed":
      return "outline";
    case "Cancelled":
      return "destructive";
    default:
      return "default";
  }
}

function typeColor(type: Exam["type"]) {
  switch (type) {
    case "Internal":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "External":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "Practical":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "Viva":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    default:
      return "";
  }
}

export function ExamManagement() {
  const {
    exams,
    addExam,
    updateExam,
    deleteExam,
    addResult,
    updateResult,
    deleteResult,
    getResultsByExam,
  } = useExamStore();
  const { subjects, rooms } = useTimetableStore();
  const { faculty } = useFacultyStore();
  const { addLog } = useAuditStore();

  const teachers = faculty.filter(
    (f) => f.role === "teacher" && f.approvalStatus === "approved",
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [form, setForm] = useState<Omit<Exam, "id" | "createdAt">>(EMPTY_EXAM);
  const [selectedInvigilators, setSelectedInvigilators] = useState<string[]>(
    [],
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedExamForResults, setSelectedExamForResults] =
    useState<string>("");
  const [newResultRow, setNewResultRow] = useState({
    studentName: "",
    rollNumber: "",
    marksObtained: 0,
    remarks: "",
  });
  const [gradeSheetExamId, setGradeSheetExamId] = useState<string>("");
  const [editResultId, setEditResultId] = useState<string | null>(null);
  const [editResultForm, setEditResultForm] = useState({
    marksObtained: 0,
    remarks: "",
  });
  const [deleteResultId, setDeleteResultId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: exams.length,
      upcoming: exams.filter((e) => e.status === "Scheduled").length,
      completed: exams.filter((e) => e.status === "Completed").length,
      cancelled: exams.filter((e) => e.status === "Cancelled").length,
    }),
    [exams],
  );

  const openAdd = () => {
    setForm(EMPTY_EXAM);
    setSelectedInvigilators([]);
    setEditExam(null);
    setIsAddOpen(true);
  };

  const openEdit = (exam: Exam) => {
    setForm({ ...exam });
    setSelectedInvigilators(exam.invigilatorIds);
    setEditExam(exam);
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.subjectId || !form.date) {
      toast.error("Please fill all required fields / सभी फ़ील्ड भरें");
      return;
    }
    const examData = { ...form, invigilatorIds: selectedInvigilators };
    if (editExam) {
      updateExam(editExam.id, examData);
      addLog({
        actorId: "demo-admin",
        actorName: "Dr. Rajesh Kumar",
        action: `Updated exam: ${form.title}`,
        category: "Exam",
        details: `Date: ${form.date}`,
      });
      toast.success("Exam updated / परीक्षा अपडेट की गई");
    } else {
      const created = addExam(examData);
      addLog({
        actorId: "demo-admin",
        actorName: "Dr. Rajesh Kumar",
        action: `Scheduled exam: ${form.title}`,
        category: "Exam",
        details: `Date: ${form.date} | Room: ${rooms.find((r) => r.id === form.roomId)?.name ?? form.roomId}`,
      });
      toast.success(`Exam scheduled / परीक्षा निर्धारित: ${created.title}`);
    }
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    const exam = exams.find((e) => e.id === id);
    deleteExam(id);
    addLog({
      actorId: "demo-admin",
      actorName: "Dr. Rajesh Kumar",
      action: `Deleted exam: ${exam?.title ?? id}`,
      category: "Exam",
    });
    toast.success("Exam deleted / परीक्षा हटाई गई");
    setDeleteConfirmId(null);
  };

  const toggleInvigilator = (id: string) => {
    setSelectedInvigilators((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAddResult = () => {
    if (!selectedExamForResults) return;
    if (!newResultRow.studentName || !newResultRow.rollNumber) {
      toast.error("Enter student name and roll number");
      return;
    }
    addResult({ ...newResultRow, examId: selectedExamForResults });
    setNewResultRow({
      studentName: "",
      rollNumber: "",
      marksObtained: 0,
      remarks: "",
    });
    toast.success("Result added / परिणाम जोड़ा गया");
  };

  const currentExamResults = selectedExamForResults
    ? getResultsByExam(selectedExamForResults)
    : [];
  const currentExam = exams.find((e) => e.id === selectedExamForResults);
  const classAverage = currentExamResults.length
    ? Math.round(
        (currentExamResults.reduce((s, r) => s + r.marksObtained, 0) /
          currentExamResults.length) *
          10,
      ) / 10
    : 0;
  const highest = currentExamResults.length
    ? Math.max(...currentExamResults.map((r) => r.marksObtained))
    : 0;

  const gradeSheetResults = gradeSheetExamId
    ? getResultsByExam(gradeSheetExamId)
        .slice()
        .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber))
    : [];
  const gsExam = exams.find((e) => e.id === gradeSheetExamId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="exam_management.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exam Management</h1>
          <p className="text-sm text-muted-foreground">परीक्षा प्रबंधन</p>
        </div>
        <Button onClick={openAdd} data-ocid="exam.add_button">
          <PlusIcon className="w-4 h-4 mr-2" /> Schedule Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Exams",
            labelH: "कुल परीक्षाएं",
            value: stats.total,
            icon: <BookOpenIcon className="w-5 h-5" />,
            color: "text-primary",
          },
          {
            label: "Upcoming",
            labelH: "आगामी",
            value: stats.upcoming,
            icon: <CalendarIcon className="w-5 h-5" />,
            color: "text-blue-500",
          },
          {
            label: "Completed",
            labelH: "पूर्ण",
            value: stats.completed,
            icon: <CheckCircleIcon className="w-5 h-5" />,
            color: "text-green-500",
          },
          {
            label: "Cancelled",
            labelH: "रद्द",
            value: stats.cancelled,
            icon: <XCircleIcon className="w-5 h-5" />,
            color: "text-destructive",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-card">
            <CardContent className="pt-6 pb-4">
              <div className={`mb-2 ${s.color}`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground">
                {s.labelH}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule" data-ocid="exam.schedule.tab">
            अनुसूची / Schedule
          </TabsTrigger>
          <TabsTrigger value="results" data-ocid="exam.results.tab">
            परिणाम / Results
          </TabsTrigger>
          <TabsTrigger value="gradesheet" data-ocid="exam.gradesheet.tab">
            ग्रेड शीट / Grade Sheet
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table data-ocid="exam.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam, i) => {
                    const subject = subjects.find(
                      (s) => s.id === exam.subjectId,
                    );
                    const room = rooms.find((r) => r.id === exam.roomId);
                    return (
                      <TableRow key={exam.id} data-ocid={`exam.item.${i + 1}`}>
                        <TableCell className="font-medium">
                          {exam.title}
                        </TableCell>
                        <TableCell>
                          {subject?.name ?? exam.subjectId}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {subject?.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          {exam.date}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {exam.startTime}–{exam.endTime}
                          </span>
                        </TableCell>
                        <TableCell>{room?.name ?? exam.roomId}</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(exam.type)}`}
                          >
                            {exam.type}
                          </span>
                        </TableCell>
                        <TableCell>{exam.maxMarks}</TableCell>
                        <TableCell>
                          <Badge variant={statusColor(exam.status)}>
                            {exam.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(exam)}
                              data-ocid={`exam.edit_button.${i + 1}`}
                            >
                              <EditIcon className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirmId(exam.id)}
                              data-ocid={`exam.delete_button.${i + 1}`}
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card className="border-border shadow-card">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedExamForResults}
                  onValueChange={setSelectedExamForResults}
                >
                  <SelectTrigger
                    className="w-72"
                    data-ocid="exam.results.select"
                  >
                    <SelectValue placeholder="Select completed exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams
                      .filter((e) => e.status === "Completed")
                      .map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {currentExamResults.length > 0 && (
                  <div className="flex gap-4 text-sm">
                    <span>
                      Avg:{" "}
                      <strong>
                        {classAverage}/{currentExam?.maxMarks}
                      </strong>
                    </span>
                    <span>
                      Highest: <strong>{highest}</strong>
                    </span>
                    <span>
                      Students: <strong>{currentExamResults.length}</strong>
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedExamForResults && (
                <>
                  <Table data-ocid="exam.results.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>
                          Marks / {currentExam?.maxMarks ?? "—"}
                        </TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentExamResults.map((r, i) => (
                        <TableRow
                          key={r.id}
                          data-ocid={`exam.result.item.${i + 1}`}
                        >
                          <TableCell>{r.rollNumber}</TableCell>
                          <TableCell>{r.studentName}</TableCell>
                          <TableCell>{r.marksObtained}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{r.grade}</Badge>
                          </TableCell>
                          <TableCell>{r.remarks ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-7 h-7 p-0"
                                onClick={() => {
                                  setEditResultId(r.id);
                                  setEditResultForm({
                                    marksObtained: r.marksObtained,
                                    remarks: r.remarks ?? "",
                                  });
                                }}
                                data-ocid={`exam.result.edit_button.${i + 1}`}
                              >
                                <EditIcon className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-7 h-7 p-0 text-destructive hover:text-destructive"
                                onClick={() => setDeleteResultId(r.id)}
                                data-ocid={`exam.result.delete_button.${i + 1}`}
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Add new result row */}
                      <TableRow>
                        <TableCell>
                          <Input
                            placeholder="Roll No."
                            value={newResultRow.rollNumber}
                            onChange={(e) =>
                              setNewResultRow((p) => ({
                                ...p,
                                rollNumber: e.target.value,
                              }))
                            }
                            data-ocid="exam.result.roll_input"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Name"
                            value={newResultRow.studentName}
                            onChange={(e) =>
                              setNewResultRow((p) => ({
                                ...p,
                                studentName: e.target.value,
                              }))
                            }
                            data-ocid="exam.result.name_input"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="Marks"
                            value={newResultRow.marksObtained || ""}
                            onChange={(e) =>
                              setNewResultRow((p) => ({
                                ...p,
                                marksObtained: Number(e.target.value),
                              }))
                            }
                            data-ocid="exam.result.marks_input"
                          />
                        </TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>
                          <Input
                            placeholder="Remarks"
                            value={newResultRow.remarks}
                            onChange={(e) =>
                              setNewResultRow((p) => ({
                                ...p,
                                remarks: e.target.value,
                              }))
                            }
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="mt-3">
                    <Button
                      onClick={handleAddResult}
                      data-ocid="exam.result.add_button"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" /> Add Result
                    </Button>
                  </div>
                </>
              )}
              {!selectedExamForResults && (
                <p
                  className="text-sm text-muted-foreground text-center py-8"
                  data-ocid="exam.results.empty_state"
                >
                  Select a completed exam to view/add results
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grade Sheet Tab */}
        <TabsContent value="gradesheet">
          <Card className="border-border shadow-card">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Select
                  value={gradeSheetExamId}
                  onValueChange={setGradeSheetExamId}
                >
                  <SelectTrigger
                    className="w-72"
                    data-ocid="exam.gradesheet.select"
                  >
                    <SelectValue placeholder="Select exam for grade sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {gradeSheetExamId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    data-ocid="exam.gradesheet.print_button"
                  >
                    <PrinterIcon className="w-4 h-4 mr-2" /> Print Grade Sheet
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {gradeSheetExamId && gsExam ? (
                <>
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <p className="font-bold text-lg">{gsExam.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {gsExam.date} | Max Marks: {gsExam.maxMarks} | Total
                      Students: {gradeSheetResults.length}
                    </p>
                    {gradeSheetResults.length > 0 && (
                      <p className="text-sm mt-1">
                        Average:{" "}
                        {Math.round(
                          (gradeSheetResults.reduce(
                            (s, r) => s + r.marksObtained,
                            0,
                          ) /
                            gradeSheetResults.length) *
                            10,
                        ) / 10}{" "}
                        &nbsp;| Pass Rate:{" "}
                        {Math.round(
                          (gradeSheetResults.filter((r) => r.grade !== "F")
                            .length /
                            gradeSheetResults.length) *
                            100,
                        )}
                        %
                      </p>
                    )}
                  </div>
                  <Table data-ocid="exam.gradesheet.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No.</TableHead>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gradeSheetResults.map((r, i) => (
                        <TableRow
                          key={r.id}
                          data-ocid={`exam.gradesheet.item.${i + 1}`}
                        >
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{r.rollNumber}</TableCell>
                          <TableCell>{r.studentName}</TableCell>
                          <TableCell>{r.marksObtained}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                r.grade === "F" ? "destructive" : "outline"
                              }
                            >
                              {r.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>{r.remarks ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {gradeSheetResults.length === 0 && (
                    <p
                      className="text-sm text-muted-foreground text-center py-8"
                      data-ocid="exam.gradesheet.empty_state"
                    >
                      No results entered for this exam yet
                    </p>
                  )}
                </>
              ) : (
                <p
                  className="text-sm text-muted-foreground text-center py-8"
                  data-ocid="exam.gradesheet.empty_state"
                >
                  Select an exam to view the grade sheet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Exam Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg" data-ocid="exam.dialog">
          <DialogHeader>
            <DialogTitle>
              {editExam
                ? "Edit Exam / परीक्षा संपादित करें"
                : "Schedule Exam / परीक्षा निर्धारित करें"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Title / शीर्षक</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Internal Assessment CS-101"
                data-ocid="exam.title.input"
              />
            </div>
            <div>
              <Label>Subject / विषय</Label>
              <Select
                value={form.subjectId}
                onValueChange={(v) => setForm((p) => ({ ...p, subjectId: v }))}
              >
                <SelectTrigger data-ocid="exam.subject.select">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type / प्रकार</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as Exam["type"] }))
                }
              >
                <SelectTrigger data-ocid="exam.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Internal", "External", "Practical", "Viva"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date / तारीख</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="exam.date.input"
              />
            </div>
            <div>
              <Label>Room / कक्ष</Label>
              <Select
                value={form.roomId}
                onValueChange={(v) => setForm((p) => ({ ...p, roomId: v }))}
              >
                <SelectTrigger data-ocid="exam.room.select">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startTime: e.target.value }))
                }
                data-ocid="exam.start_time.input"
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endTime: e.target.value }))
                }
                data-ocid="exam.end_time.input"
              />
            </div>
            <div>
              <Label>Max Marks / अधिकतम अंक</Label>
              <Input
                type="number"
                value={form.maxMarks}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxMarks: Number(e.target.value) }))
                }
                data-ocid="exam.marks.input"
              />
            </div>
            <div>
              <Label>Status / स्थिति</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, status: v as Exam["status"] }))
                }
              >
                <SelectTrigger data-ocid="exam.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Scheduled", "Ongoing", "Completed", "Cancelled"].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Invigilators / परीक्षक</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {teachers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleInvigilator(t.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedInvigilators.includes(t.id)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary"
                    }`}
                    data-ocid="exam.invigilator.toggle"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              data-ocid="exam.dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} data-ocid="exam.dialog.submit_button">
              {editExam ? "Update" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent data-ocid="exam.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Exam / परीक्षा हटाएं?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will delete the exam and all associated results. This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              data-ocid="exam.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              data-ocid="exam.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Result Dialog */}
      <Dialog open={!!editResultId} onOpenChange={() => setEditResultId(null)}>
        <DialogContent data-ocid="exam.result.edit.dialog">
          <DialogHeader>
            <DialogTitle>परिणाम संपादित करें / Edit Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Marks Obtained / प्राप्तांक</Label>
              <Input
                type="number"
                value={editResultForm.marksObtained}
                onChange={(e) =>
                  setEditResultForm((p) => ({
                    ...p,
                    marksObtained: Number(e.target.value),
                  }))
                }
                data-ocid="exam.result.edit.marks.input"
              />
            </div>
            <div>
              <Label>Remarks / टिप्पणी</Label>
              <Input
                value={editResultForm.remarks}
                onChange={(e) =>
                  setEditResultForm((p) => ({ ...p, remarks: e.target.value }))
                }
                data-ocid="exam.result.edit.remarks.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditResultId(null)}
              data-ocid="exam.result.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editResultId) {
                  updateResult(editResultId, editResultForm);
                  setEditResultId(null);
                  toast.success("Result updated / परिणाम अपडेट");
                }
              }}
              data-ocid="exam.result.edit.save_button"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Result Confirmation */}
      <AlertDialog
        open={!!deleteResultId}
        onOpenChange={() => setDeleteResultId(null)}
      >
        <AlertDialogContent data-ocid="exam.result.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this exam result. / यह परीक्षा परिणाम
              स्थायी रूप से हट जाएगा।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="exam.result.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteResultId) {
                  deleteResult(deleteResultId);
                  setDeleteResultId(null);
                  toast.success("Result deleted / परिणाम हटाया");
                }
              }}
              data-ocid="exam.result.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
