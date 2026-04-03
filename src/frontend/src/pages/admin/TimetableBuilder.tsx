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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  Calendar,
  DoorOpen,
  GraduationCap,
  Plus,
  Trash2,
  Users2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TimetableGrid } from "../../components/TimetableGrid";
import { useCourseStore } from "../../store/useCourseStore";
import { useDepartmentStore } from "../../store/useDepartmentStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { DayOfWeek } from "../../types/models";

const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function TimetableBuilder() {
  const {
    semesters,
    subjects,
    rooms,
    batches,
    entries,
    addEntry,
    removeEntry,
    addSemester,
    addSubject,
    addRoom,
    addBatch,
  } = useTimetableStore();
  const { getApprovedTeachers } = useFacultyStore();
  const { departments } = useDepartmentStore();
  const { courses, addCourse } = useCourseStore();
  const teachers = getApprovedTeachers();
  const activeCourses = courses.filter((c) => c.isActive);

  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [resourceTab, setResourceTab] = useState("semester");
  const [clashMsg, setClashMsg] = useState<string | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [deleteEntryName, setDeleteEntryName] = useState("");

  // Entry form state
  const [entryForm, setEntryForm] = useState({
    subjectId: "",
    teacherId: "",
    roomId: "",
    batchId: "",
    day: "Monday" as DayOfWeek,
    startTime: "09:00",
    endTime: "10:00",
    weekType: "all" as "odd" | "even" | "all",
    departmentId: "",
    courseId: "",
  });

  // Resource form state
  const [semName, setSemName] = useState("");
  const [semProgram, setSemProgram] = useState("");
  const [semNum, setSemNum] = useState("1");
  const [subCode, setSubCode] = useState("");
  const [subName, setSubName] = useState("");
  const [subType, setSubType] = useState<"Theory" | "Practical">("Theory");
  const [subSemId, setSubSemId] = useState("");
  const [subCredits, setSubCredits] = useState("4");
  const [roomName, setRoomName] = useState("");
  const [roomCap, setRoomCap] = useState("60");
  const [roomType, setRoomType] = useState<"Classroom" | "Lab">("Classroom");
  const [batchName, setBatchName] = useState("");
  const [batchSemId, setBatchSemId] = useState("");
  const [batchStrength, setBatchStrength] = useState("60");
  // Course resource form state
  const [courseName, setCourseName] = useState("");
  const [courseFullName, setCourseFullName] = useState("");
  const [courseActive, setCourseActive] = useState(true);

  const handleAddEntry = () => {
    if (
      !entryForm.subjectId ||
      !entryForm.teacherId ||
      !entryForm.roomId ||
      !entryForm.batchId
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    const result = addEntry(entryForm);
    if (!result.success) {
      setClashMsg(result.clash ?? "Clash detected");
      return;
    }
    setClashMsg(null);
    setAddEntryOpen(false);
    toast.success("समयसारणी प्रविष्टि जोड़ी / Timetable entry added");
  };

  const handleAddResource = () => {
    if (resourceTab === "semester") {
      if (!semName || !semProgram) {
        toast.error("Fill required fields");
        return;
      }
      addSemester({
        name: semName,
        program: semProgram,
        semesterNumber: Number(semNum),
        isActive: true,
      });
      setSemName("");
      setSemProgram("");
      setSemNum("1");
    } else if (resourceTab === "subject") {
      if (!subCode || !subName || !subSemId) {
        toast.error("Fill required fields");
        return;
      }
      addSubject({
        code: subCode,
        name: subName,
        type: subType,
        semesterId: subSemId,
        creditHours: Number(subCredits),
      });
      setSubCode("");
      setSubName("");
      setSubSemId("");
    } else if (resourceTab === "room") {
      if (!roomName) {
        toast.error("Fill required fields");
        return;
      }
      addRoom({
        name: roomName,
        capacity: Number(roomCap),
        type: roomType,
        isActive: true,
      });
      setRoomName("");
    } else if (resourceTab === "batch") {
      if (!batchName || !batchSemId) {
        toast.error("Fill required fields");
        return;
      }
      addBatch({
        name: batchName,
        semesterId: batchSemId,
        strength: Number(batchStrength),
      });
      setBatchName("");
      setBatchSemId("");
    } else if (resourceTab === "course") {
      if (!courseName || !courseFullName) {
        toast.error("Fill required fields");
        return;
      }
      addCourse({
        name: courseName,
        fullName: courseFullName,
        duration: 3,
        totalSemesters: 6,
        monthlyClassLimit: 45000,
        isActive: courseActive,
      });
      setCourseName("");
      setCourseFullName("");
      setCourseActive(true);
    }
    toast.success("संसाधन जोड़ा / Resource added");
    setAddResourceOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="timetable_builder.page"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">
            समयसारणी निर्माता / Timetable Builder
          </h2>
          <p className="text-xs text-muted-foreground">
            {entries.length} entries across all semesters
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddResourceOpen(true)}
            data-ocid="timetable_builder.secondary_button"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Resource
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setClashMsg(null);
              setAddEntryOpen(true);
            }}
            data-ocid="timetable_builder.primary_button"
          >
            <Calendar className="w-4 h-4 mr-1" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Resources overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {
            label: "Semesters",
            labelHi: "सत्र",
            count: semesters.length,
            icon: <Calendar className="w-4 h-4" />,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Subjects",
            labelHi: "विषय",
            count: subjects.length,
            icon: <BookOpen className="w-4 h-4" />,
            color: "text-teal-600 bg-teal-100",
          },
          {
            label: "Rooms",
            labelHi: "कक्ष",
            count: rooms.filter((r) => r.isActive).length,
            icon: <DoorOpen className="w-4 h-4" />,
            color: "text-purple-600 bg-purple-100",
          },
          {
            label: "Batches",
            labelHi: "समूह",
            count: batches.length,
            icon: <Users2 className="w-4 h-4" />,
            color: "text-orange-600 bg-orange-100",
          },
          {
            label: "Courses",
            labelHi: "पाठ्यक्रम",
            count: activeCourses.length,
            icon: <GraduationCap className="w-4 h-4" />,
            color: "text-emerald-600 bg-emerald-100",
          },
        ].map((item) => (
          <Card key={item.label} className="border-border shadow-xs">
            <CardContent className="p-3 flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}
              >
                {item.icon}
              </div>
              <div>
                <div className="text-lg font-bold">{item.count}</div>
                <div className="text-xs text-muted-foreground">
                  {item.label} / {item.labelHi}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timetable grid */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              साप्ताहिक दृश्य / Weekly View
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {entries.length} entries
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border border-border rounded-lg overflow-hidden">
            <TimetableGrid
              entries={entries}
              onEntryClick={(e) => {
                setDeleteEntryId(e.id);
                setDeleteEntryName(
                  subjects.find((s) => s.id === e.subjectId)?.name ??
                    "this entry",
                );
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click on an entry to remove it
          </p>
        </CardContent>
      </Card>

      {/* Add Entry Dialog */}
      <Dialog open={addEntryOpen} onOpenChange={setAddEntryOpen}>
        <DialogContent className="max-w-md" data-ocid="timetable_entry.dialog">
          <DialogHeader>
            <DialogTitle>नई प्रविष्टि / Add Entry</DialogTitle>
          </DialogHeader>
          {clashMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{clashMsg}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {/* Department — new field */}
            <div className="col-span-2">
              <Label className="text-xs">विभाग / Department</Label>
              <Select
                value={entryForm.departmentId || "none"}
                onValueChange={(v) =>
                  setEntryForm((p) => ({
                    ...p,
                    departmentId: v === "none" ? "" : v,
                  }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="timetable_entry.department.select"
                >
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course — new field */}
            <div className="col-span-2">
              <Label className="text-xs">पाठ्यक्रम / Course</Label>
              <Select
                value={entryForm.courseId || "none"}
                onValueChange={(v) =>
                  setEntryForm((p) => ({
                    ...p,
                    courseId: v === "none" ? "" : v,
                  }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="timetable_entry.course.select"
                >
                  <SelectValue placeholder="Select course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {activeCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label className="text-xs">विषय / Subject</Label>
              <Select
                value={entryForm.subjectId}
                onValueChange={(v) =>
                  setEntryForm((p) => ({ ...p, subjectId: v }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="timetable_entry.select"
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
            <div className="col-span-2">
              <Label className="text-xs">शिक्षक / Teacher</Label>
              <Select
                value={entryForm.teacherId}
                onValueChange={(v) =>
                  setEntryForm((p) => ({ ...p, teacherId: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">कक्ष / Room</Label>
              <Select
                value={entryForm.roomId}
                onValueChange={(v) =>
                  setEntryForm((p) => ({ ...p, roomId: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms
                    .filter((r) => r.isActive)
                    .map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">समूह / Batch</Label>
              <Select
                value={entryForm.batchId}
                onValueChange={(v) =>
                  setEntryForm((p) => ({ ...p, batchId: v }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Batch" />
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
              <Label className="text-xs">दिन / Day</Label>
              <Select
                value={entryForm.day}
                onValueChange={(v) =>
                  setEntryForm((p) => ({ ...p, day: v as DayOfWeek }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">सप्ताह प्रकार / Week</Label>
              <Select
                value={entryForm.weekType}
                onValueChange={(v) =>
                  setEntryForm((p) => ({
                    ...p,
                    weekType: v as "odd" | "even" | "all",
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  <SelectItem value="odd">Odd Weeks</SelectItem>
                  <SelectItem value="even">Even Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">शुरू / Start Time</Label>
              <Input
                type="time"
                value={entryForm.startTime}
                onChange={(e) =>
                  setEntryForm((p) => ({ ...p, startTime: e.target.value }))
                }
                className="mt-1"
                data-ocid="timetable_entry.input"
              />
            </div>
            <div>
              <Label className="text-xs">अंत / End Time</Label>
              <Input
                type="time"
                value={entryForm.endTime}
                onChange={(e) =>
                  setEntryForm((p) => ({ ...p, endTime: e.target.value }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddEntryOpen(false)}
              data-ocid="timetable_entry.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEntry}
              data-ocid="timetable_entry.submit_button"
            >
              जोड़ें / Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Resource Dialog */}
      <Dialog open={addResourceOpen} onOpenChange={setAddResourceOpen}>
        <DialogContent
          className="max-w-md"
          data-ocid="timetable_resource.dialog"
        >
          <DialogHeader>
            <DialogTitle>संसाधन जोड़ें / Add Resource</DialogTitle>
          </DialogHeader>
          <Tabs value={resourceTab} onValueChange={setResourceTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="semester">Sem</TabsTrigger>
              <TabsTrigger value="subject">Subject</TabsTrigger>
              <TabsTrigger value="room">Room</TabsTrigger>
              <TabsTrigger value="batch">Batch</TabsTrigger>
              <TabsTrigger value="course">Course</TabsTrigger>
            </TabsList>
            <TabsContent value="semester" className="space-y-3 pt-3">
              <div>
                <Label className="text-xs">नाम / Name</Label>
                <Input
                  value={semName}
                  onChange={(e) => setSemName(e.target.value)}
                  placeholder="BCA Semester I"
                  className="mt-1"
                  data-ocid="timetable_resource.input"
                />
              </div>
              <div>
                <Label className="text-xs">कार्यक्रम / Program</Label>
                <Input
                  value={semProgram}
                  onChange={(e) => setSemProgram(e.target.value)}
                  placeholder="BCA"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">संख्या / Number</Label>
                <Input
                  type="number"
                  value={semNum}
                  onChange={(e) => setSemNum(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>
            <TabsContent value="subject" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Code</Label>
                  <Input
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="CS-101"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Credits</Label>
                  <Input
                    type="number"
                    value={subCredits}
                    onChange={(e) => setSubCredits(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Introduction to..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select
                  value={subType}
                  onValueChange={(v) => setSubType(v as "Theory" | "Practical")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Theory">Theory</SelectItem>
                    <SelectItem value="Practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Semester</Label>
                <Select value={subSemId} onValueChange={setSubSemId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="room" className="space-y-3 pt-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Room 101"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Capacity</Label>
                  <Input
                    type="number"
                    value={roomCap}
                    onChange={(e) => setRoomCap(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={roomType}
                    onValueChange={(v) => setRoomType(v as "Classroom" | "Lab")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Classroom">Classroom</SelectItem>
                      <SelectItem value="Lab">Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="batch" className="space-y-3 pt-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="BCA-I-A"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Semester</Label>
                <Select value={batchSemId} onValueChange={setBatchSemId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Strength</Label>
                <Input
                  type="number"
                  value={batchStrength}
                  onChange={(e) => setBatchStrength(e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>
            <TabsContent value="course" className="space-y-3 pt-3">
              <div>
                <Label className="text-xs">
                  पाठ्यक्रम संक्षिप्त नाम / Course Short Name *
                </Label>
                <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. BCA, MCA, M.Sc. IT"
                  className="mt-1"
                  data-ocid="timetable_resource.course.input"
                />
              </div>
              <div>
                <Label className="text-xs">पूरा नाम / Full Name *</Label>
                <Input
                  value={courseFullName}
                  onChange={(e) => setCourseFullName(e.target.value)}
                  placeholder="Bachelor of Computer Applications"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  id="courseActive"
                  checked={courseActive}
                  onCheckedChange={(v) => setCourseActive(!!v)}
                  data-ocid="timetable_resource.course.checkbox"
                />
                <Label
                  htmlFor="courseActive"
                  className="text-xs cursor-pointer"
                >
                  सक्रिय / Active
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly billing limit can be configured in Course Management.
              </p>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddResourceOpen(false)}
              data-ocid="timetable_resource.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddResource}
              data-ocid="timetable_resource.submit_button"
            >
              जोड़ें / Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Entry Confirmation */}
      <AlertDialog
        open={!!deleteEntryId}
        onOpenChange={() => setDeleteEntryId(null)}
      >
        <AlertDialogContent data-ocid="timetable.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Remove timetable entry for "{deleteEntryName}"? / "
              {deleteEntryName}" के लिए प्रविष्टि हटाएं?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="timetable.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteEntryId) {
                  removeEntry(deleteEntryId);
                  setDeleteEntryId(null);
                  toast.success("प्रविष्टि हटाई / Entry removed");
                }
              }}
              data-ocid="timetable.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
