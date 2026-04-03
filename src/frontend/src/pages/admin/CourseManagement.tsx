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
import {
  BookOpen,
  Edit2,
  Plus,
  Settings,
  Trash2,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCourseStore } from "../../store/useCourseStore";
import { useFacultyStore } from "../../store/useFacultyStore";
import type { Course, CourseAssignment } from "../../types/models";

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

export function CourseManagement() {
  const {
    courses,
    assignments,
    addCourse,
    updateCourse,
    deleteCourse,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  } = useCourseStore();
  const { faculty } = useFacultyStore();
  const teachers = faculty.filter(
    (f) => f.role === "teacher" && f.approvalStatus === "approved",
  );

  const [courseDialog, setCourseDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editAssign, setEditAssign] = useState<CourseAssignment | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [deleteAssignId, setDeleteAssignId] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState({
    name: "",
    fullName: "",
    duration: "3",
    totalSemesters: "6",
    monthlyClassLimit: "45000",
  });
  const [assignForm, setAssignForm] = useState({
    courseId: "",
    className: "",
    subjectName: "",
    paperCode: "",
    teacherId: "",
    section: "A",
    batch: "",
    monthlyLimit: "45000",
  });

  const openAddCourse = () => {
    setEditCourse(null);
    setCourseForm({
      name: "",
      fullName: "",
      duration: "3",
      totalSemesters: "6",
      monthlyClassLimit: "45000",
    });
    setCourseDialog(true);
  };
  const openEditCourse = (c: Course) => {
    setEditCourse(c);
    setCourseForm({
      name: c.name,
      fullName: c.fullName,
      duration: String(c.duration),
      totalSemesters: String(c.totalSemesters),
      monthlyClassLimit: String(c.monthlyClassLimit),
    });
    setCourseDialog(true);
  };
  const openAddAssign = () => {
    setEditAssign(null);
    setAssignForm({
      courseId: "",
      className: "",
      subjectName: "",
      paperCode: "",
      teacherId: "",
      section: "A",
      batch: "",
      monthlyLimit: "45000",
    });
    setAssignDialog(true);
  };
  const openEditAssign = (a: CourseAssignment) => {
    setEditAssign(a);
    setAssignForm({
      courseId: a.courseId,
      className: a.className,
      subjectName: a.subjectName,
      paperCode: a.paperCode,
      teacherId: a.teacherId,
      section: a.section,
      batch: a.batch,
      monthlyLimit: String(a.monthlyLimit),
    });
    setAssignDialog(true);
  };

  const saveCourse = () => {
    if (!courseForm.name || !courseForm.fullName) {
      toast.error("Name and Full Name are required");
      return;
    }
    if (editCourse) {
      updateCourse(editCourse.id, {
        name: courseForm.name,
        fullName: courseForm.fullName,
        duration: Number(courseForm.duration),
        totalSemesters: Number(courseForm.totalSemesters),
        monthlyClassLimit: Number(courseForm.monthlyClassLimit),
      });
      toast.success("कोर्स अपडेट / Course updated");
    } else {
      addCourse({
        name: courseForm.name,
        fullName: courseForm.fullName,
        duration: Number(courseForm.duration),
        totalSemesters: Number(courseForm.totalSemesters),
        monthlyClassLimit: Number(courseForm.monthlyClassLimit),
        isActive: true,
      });
      toast.success("कोर्स जोड़ा / Course added");
    }
    setCourseDialog(false);
  };

  const saveAssign = () => {
    if (
      !assignForm.courseId ||
      !assignForm.className ||
      !assignForm.subjectName ||
      !assignForm.paperCode ||
      !assignForm.teacherId
    ) {
      toast.error("All fields required");
      return;
    }
    const teacher = teachers.find((t) => t.id === assignForm.teacherId);
    if (editAssign) {
      updateAssignment(editAssign.id, {
        ...assignForm,
        monthlyLimit: Number(assignForm.monthlyLimit),
        teacherName: teacher?.name ?? "",
      });
      toast.success("नियुक्ति अपडेट / Assignment updated");
    } else {
      addAssignment({
        ...assignForm,
        monthlyLimit: Number(assignForm.monthlyLimit),
        teacherName: teacher?.name ?? "",
      });
      toast.success("नियुक्ति जोड़ी / Assignment added");
    }
    setAssignDialog(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Course Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage courses and faculty-class-subject assignments
          </p>
        </div>
      </div>

      <Tabs defaultValue="courses">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="assignments">Faculty Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddCourse} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Course
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c, i) => (
              <Card
                key={c.id}
                data-ocid={`course_management.course.item.${i + 1}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditCourse(c)}
                        data-ocid={`course_management.course.edit_button.${i + 1}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => setDeleteCourseId(c.id)}
                        data-ocid={`course_management.course.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-gray-600">{c.fullName}</p>
                  <div className="flex gap-4 text-gray-500">
                    <span>Duration: {c.duration} yrs</span>
                    <span>Semesters: {c.totalSemesters}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-orange-500" />
                    <span className="font-medium text-orange-600">
                      Monthly Limit: ₹{c.monthlyClassLimit.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {courses.length === 0 && (
              <div
                className="col-span-2 text-center py-12 text-muted-foreground"
                data-ocid="course_management.course.empty_state"
              >
                No courses configured yet
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddAssign} className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Assign Faculty
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Paper Code</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Monthly Limit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((a, i) => (
                      <TableRow
                        key={a.id}
                        data-ocid={`course_management.assign.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">
                          {a.teacherName}
                        </TableCell>
                        <TableCell>{a.className}</TableCell>
                        <TableCell>{a.subjectName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{a.paperCode}</Badge>
                        </TableCell>
                        <TableCell>{a.section}</TableCell>
                        <TableCell className="text-orange-600 font-medium">
                          ₹{a.monthlyLimit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditAssign(a)}
                              data-ocid={`course_management.assign.edit_button.${i + 1}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => setDeleteAssignId(a.id)}
                              data-ocid={`course_management.assign.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {assignments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-gray-500 py-8"
                          data-ocid="course_management.assign.empty_state"
                        >
                          No assignments yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Dialog */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent data-ocid="course_management.course.dialog">
          <DialogHeader>
            <DialogTitle>
              {editCourse
                ? "कोर्स संपादित करें / Edit Course"
                : "Add Course / कोर्स जोड़ें"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Short Name (e.g. BCA)</Label>
              <Input
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="course_management.course.name.input"
              />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                value={courseForm.fullName}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, fullName: e.target.value }))
                }
                data-ocid="course_management.course.fullname.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (years)</Label>
                <Input
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) =>
                    setCourseForm((p) => ({ ...p, duration: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Total Semesters</Label>
                <Input
                  type="number"
                  value={courseForm.totalSemesters}
                  onChange={(e) =>
                    setCourseForm((p) => ({
                      ...p,
                      totalSemesters: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Monthly Class Limit (₹)</Label>
              <Input
                type="number"
                value={courseForm.monthlyClassLimit}
                onChange={(e) =>
                  setCourseForm((p) => ({
                    ...p,
                    monthlyClassLimit: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourseDialog(false)}
              data-ocid="course_management.course.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCourse}
              data-ocid="course_management.course.save_button"
            >
              {editCourse ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent data-ocid="course_management.assign.dialog">
          <DialogHeader>
            <DialogTitle>
              {editAssign
                ? "नियुक्ति संपादित करें / Edit Assignment"
                : "Assign Faculty to Class"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Course</Label>
              <Select
                value={assignForm.courseId}
                onValueChange={(v) =>
                  setAssignForm((p) => ({ ...p, courseId: v }))
                }
              >
                <SelectTrigger data-ocid="course_management.assign.course.select">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select
                value={assignForm.className}
                onValueChange={(v) =>
                  setAssignForm((p) => ({ ...p, className: v }))
                }
              >
                <SelectTrigger data-ocid="course_management.assign.class.select">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Subject Name</Label>
                <Input
                  value={assignForm.subjectName}
                  onChange={(e) =>
                    setAssignForm((p) => ({
                      ...p,
                      subjectName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Paper Code</Label>
                <Input
                  value={assignForm.paperCode}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, paperCode: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Faculty</Label>
              <Select
                value={assignForm.teacherId}
                onValueChange={(v) =>
                  setAssignForm((p) => ({ ...p, teacherId: v }))
                }
              >
                <SelectTrigger data-ocid="course_management.assign.teacher.select">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Section</Label>
                <Input
                  value={assignForm.section}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, section: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Batch</Label>
                <Input
                  placeholder="e.g. 2024-27"
                  value={assignForm.batch}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, batch: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Monthly Limit (₹)</Label>
              <Input
                type="number"
                value={assignForm.monthlyLimit}
                onChange={(e) =>
                  setAssignForm((p) => ({ ...p, monthlyLimit: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialog(false)}
              data-ocid="course_management.assign.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveAssign}
              data-ocid="course_management.assign.save_button"
            >
              {editAssign ? "Update" : "Save Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation */}
      <AlertDialog
        open={!!deleteCourseId}
        onOpenChange={() => setDeleteCourseId(null)}
      >
        <AlertDialogContent data-ocid="course_management.course.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course. / यह कोर्स स्थायी रूप से हट
              जाएगा।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="course_management.course.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteCourseId) {
                  deleteCourse(deleteCourseId);
                  toast.success("कोर्स हटाया / Course removed");
                  setDeleteCourseId(null);
                }
              }}
              data-ocid="course_management.course.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Assignment Confirmation */}
      <AlertDialog
        open={!!deleteAssignId}
        onOpenChange={() => setDeleteAssignId(null)}
      >
        <AlertDialogContent data-ocid="course_management.assign.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the faculty assignment. / यह नियुक्ति
              स्थायी रूप से हट जाएगी।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="course_management.assign.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteAssignId) {
                  deleteAssignment(deleteAssignId);
                  toast.success("नियुक्ति हटायी / Assignment removed");
                  setDeleteAssignId(null);
                }
              }}
              data-ocid="course_management.assign.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
