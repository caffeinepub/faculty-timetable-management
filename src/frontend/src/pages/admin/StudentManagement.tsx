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
import { Edit2, GraduationCap, Plus, Trash2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useStudentStore } from "../../store/useStudentStore";
import type { Student } from "../../types/models";

const CLASS_OPTIONS = [
  "BCA SEMESTER I",
  "BCA SEMESTER II",
  "BCA SEMESTER III",
  "BCA SEMESTER IV",
  "BCA SEMESTER V",
  "BCA SEMESTER VI",
  "M.Sc. IT I SEMESTER",
  "M.Sc. IT II SEMESTER",
  "M.Sc. IT III SEMESTER",
  "M.Sc. IT IV SEMESTER",
];

const DEFAULT_FORM = {
  name: "",
  rollNumber: "",
  className: "",
  section: "A",
  batch: "",
  enrollmentNo: "",
  course: "BCA",
};

export function StudentManagement() {
  const { students, addStudent, updateStudent, deleteStudent } =
    useStudentStore();
  const [filterClass, setFilterClass] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = students.filter((s) => {
    if (filterClass !== "all" && s.className !== filterClass) return false;
    if (filterCourse !== "all" && s.course !== filterCourse) return false;
    if (
      search &&
      !s.name.toLowerCase().includes(search.toLowerCase()) &&
      !s.rollNumber.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setDialog(true);
  };

  const openEdit = (s: Student) => {
    setEditTarget(s);
    setForm({
      name: s.name,
      rollNumber: s.rollNumber,
      className: s.className,
      section: s.section,
      batch: s.batch,
      enrollmentNo: s.enrollmentNo,
      course: s.course,
    });
    setDialog(true);
  };

  const handleSave = () => {
    if (!form.name || !form.rollNumber || !form.className || !form.batch) {
      toast.error("Fill all required fields");
      return;
    }
    if (editTarget) {
      updateStudent(editTarget.id, form);
      toast.success("छात्र अपडेट / Student updated");
    } else {
      addStudent(form);
      toast.success("छात्र जोड़ा / Student added");
    }
    setDialog(false);
    setForm(DEFAULT_FORM);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setDeleteId(null);
    toast.success("छात्र हटाया / Student removed");
  };

  const classStats = CLASS_OPTIONS.map((cls) => ({
    className: cls,
    count: students.filter((s) => s.className === cls).length,
  })).filter((s) => s.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Student Management
            </h1>
            <p className="text-gray-500 text-sm">
              Manage enrolled students by class and course
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/admin/bulk-upload";
            }}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Bulk Upload
          </Button>
          <Button onClick={openAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-700">
              {students.length}
            </div>
            <div className="text-sm text-blue-600">Total Students</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-700">
              {students.filter((s) => s.course === "BCA").length}
            </div>
            <div className="text-sm text-green-600">BCA Students</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-700">
              {students.filter((s) => s.course === "M.Sc. IT").length}
            </div>
            <div className="text-sm text-purple-600">M.Sc. IT Students</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-700">
              {[...new Set(students.map((s) => s.className))].length}
            </div>
            <div className="text-sm text-orange-600">Classes with Students</div>
          </CardContent>
        </Card>
      </div>

      {/* Class Summary */}
      {classStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class-wise Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {classStats.map((cs) => (
                <Badge
                  key={cs.className}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() =>
                    setFilterClass(
                      cs.className === filterClass ? "all" : cs.className,
                    )
                  }
                >
                  {cs.className}: {cs.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Input
            className="pl-4"
            placeholder="Search by name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="student_management.search_input"
          />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="BCA">BCA</SelectItem>
            <SelectItem value="M.Sc. IT">M.Sc. IT</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, i) => (
                  <TableRow
                    key={s.id}
                    data-ocid={`student_management.item.${i + 1}`}
                  >
                    <TableCell className="text-gray-500">{i + 1}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.rollNumber}</TableCell>
                    <TableCell>{s.className}</TableCell>
                    <TableCell>{s.section}</TableCell>
                    <TableCell>{s.batch}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.course}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(s)}
                          data-ocid={`student_management.edit_button.${i + 1}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => setDeleteId(s.id)}
                          data-ocid={`student_management.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500 py-10"
                      data-ocid="student_management.empty_state"
                    >
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent data-ocid="student_management.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget
                ? "छात्र संपादित करें / Edit Student"
                : "Add Student / छात्र जोड़ें"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Student Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="student_management.name.input"
                />
              </div>
              <div>
                <Label>Roll Number *</Label>
                <Input
                  value={form.rollNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rollNumber: e.target.value }))
                  }
                  data-ocid="student_management.roll_number.input"
                />
              </div>
            </div>
            <div>
              <Label>Class *</Label>
              <Select
                value={form.className}
                onValueChange={(v) => setForm((p) => ({ ...p, className: v }))}
              >
                <SelectTrigger data-ocid="student_management.class.select">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Section</Label>
                <Input
                  value={form.section}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, section: e.target.value }))
                  }
                  data-ocid="student_management.section.input"
                />
              </div>
              <div>
                <Label>Batch *</Label>
                <Input
                  placeholder="2024-27"
                  value={form.batch}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, batch: e.target.value }))
                  }
                  data-ocid="student_management.batch.input"
                />
              </div>
              <div>
                <Label>Enrollment No</Label>
                <Input
                  value={form.enrollmentNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, enrollmentNo: e.target.value }))
                  }
                  data-ocid="student_management.enrollment.input"
                />
              </div>
            </div>
            <div>
              <Label>Course</Label>
              <Select
                value={form.course}
                onValueChange={(v) => setForm((p) => ({ ...p, course: v }))}
              >
                <SelectTrigger data-ocid="student_management.course.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCA">BCA</SelectItem>
                  <SelectItem value="M.Sc. IT">M.Sc. IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialog(false)}
              data-ocid="student_management.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-ocid="student_management.save_button"
            >
              {editTarget ? "Update" : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="student_management.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the student record. / यह छात्र रिकॉर्ड
              स्थायी रूप से हट जाएगा।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="student_management.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="student_management.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
