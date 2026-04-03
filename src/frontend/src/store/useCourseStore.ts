import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Course, CourseAssignment } from "../types/models";

const SAMPLE_COURSES: Course[] = [
  {
    id: "course-1",
    name: "BCA",
    fullName: "Bachelor of Computer Applications",
    duration: 3,
    totalSemesters: 6,
    monthlyClassLimit: 45000,
    isActive: true,
  },
  {
    id: "course-2",
    name: "M.Sc. IT",
    fullName: "Master of Science in Information Technology",
    duration: 2,
    totalSemesters: 4,
    monthlyClassLimit: 45000,
    isActive: true,
  },
];

const SAMPLE_ASSIGNMENTS: CourseAssignment[] = [
  {
    id: "ca-1",
    courseId: "course-1",
    className: "BCA SEMESTER I",
    subjectName: "Programming in C",
    paperCode: "BCA-101",
    teacherId: "teacher-1",
    teacherName: "Dr. Rajesh Kumar",
    monthlyLimit: 45000,
    section: "A",
    batch: "2024-27",
    departmentId: "dept-cs",
  },
  {
    id: "ca-1b",
    courseId: "course-1",
    className: "BCA SEMESTER III",
    subjectName: "Data Structures",
    paperCode: "BCA-301",
    teacherId: "teacher-1",
    teacherName: "Dr. Rajesh Kumar",
    monthlyLimit: 45000,
    section: "A",
    batch: "2023-26",
    departmentId: "dept-it",
  },
  {
    id: "ca-2",
    courseId: "course-1",
    className: "BCA SEMESTER I",
    subjectName: "Mathematics I",
    paperCode: "BCA-102",
    teacherId: "teacher-2",
    teacherName: "Prof. Sunita Sharma",
    monthlyLimit: 45000,
    section: "A",
    batch: "2024-27",
    departmentId: "dept-mat",
  },
  {
    id: "ca-3",
    courseId: "course-2",
    className: "M.Sc. IT I SEMESTER",
    subjectName: "Advanced Database",
    paperCode: "MSC-101",
    teacherId: "teacher-3",
    teacherName: "Dr. Amit Verma",
    monthlyLimit: 45000,
    section: "A",
    batch: "2024-26",
    departmentId: "dept-it",
  },
];

export function useCourseStore() {
  const [courses, setCourses] = useLocalStorage<Course[]>(
    "ftms-courses",
    SAMPLE_COURSES,
  );
  const [assignments, setAssignments] = useLocalStorage<CourseAssignment[]>(
    "ftms-course-assignments",
    SAMPLE_ASSIGNMENTS,
  );

  const addCourse = (c: Omit<Course, "id">) => {
    setCourses((prev) => [...prev, { ...c, id: `course-${Date.now()}` }]);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addAssignment = (a: Omit<CourseAssignment, "id">) => {
    setAssignments((prev) => [...prev, { ...a, id: `ca-${Date.now()}` }]);
  };

  const updateAssignment = (id: string, updates: Partial<CourseAssignment>) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const getAssignmentsByTeacher = (teacherId: string) =>
    assignments.filter((a) => a.teacherId === teacherId);

  const getAssignmentsByClass = (className: string) =>
    assignments.filter((a) => a.className === className);

  /** Returns unique department IDs where this teacher has at least one assignment */
  const getDepartmentsByTeacher = (teacherId: string): string[] => {
    const deptIds = [
      ...new Set(
        assignments
          .filter((a) => a.teacherId === teacherId && a.departmentId)
          .map((a) => a.departmentId as string),
      ),
    ];
    return deptIds;
  };

  /** Returns assignments filtered by teacher AND department */
  const getAssignmentsByDeptAndTeacher = (
    teacherId: string,
    departmentId: string,
  ) =>
    assignments.filter(
      (a) => a.teacherId === teacherId && a.departmentId === departmentId,
    );

  return {
    courses,
    assignments,
    addCourse,
    updateCourse,
    deleteCourse,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentsByTeacher,
    getAssignmentsByClass,
    getDepartmentsByTeacher,
    getAssignmentsByDeptAndTeacher,
  };
}
