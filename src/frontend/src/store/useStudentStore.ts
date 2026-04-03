import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Student } from "../types/models";

const SAMPLE_STUDENTS: Student[] = [
  {
    id: "stu-1",
    name: "Rahul Sharma",
    rollNumber: "BCA24001",
    className: "BCA SEMESTER I",
    section: "A",
    batch: "2024-27",
    enrollmentNo: "EN24001",
    course: "BCA",
  },
  {
    id: "stu-2",
    name: "Priya Gupta",
    rollNumber: "BCA24002",
    className: "BCA SEMESTER I",
    section: "A",
    batch: "2024-27",
    enrollmentNo: "EN24002",
    course: "BCA",
  },
  {
    id: "stu-3",
    name: "Anil Meena",
    rollNumber: "BCA24003",
    className: "BCA SEMESTER I",
    section: "B",
    batch: "2024-27",
    enrollmentNo: "EN24003",
    course: "BCA",
  },
  {
    id: "stu-4",
    name: "Sunita Joshi",
    rollNumber: "BCA24004",
    className: "BCA SEMESTER II",
    section: "A",
    batch: "2023-26",
    enrollmentNo: "EN23001",
    course: "BCA",
  },
  {
    id: "stu-5",
    name: "Deepak Yadav",
    rollNumber: "BCA24005",
    className: "BCA SEMESTER II",
    section: "A",
    batch: "2023-26",
    enrollmentNo: "EN23002",
    course: "BCA",
  },
  {
    id: "stu-6",
    name: "Kavita Singh",
    rollNumber: "MSC24001",
    className: "M.Sc. IT I SEMESTER",
    section: "A",
    batch: "2024-26",
    enrollmentNo: "EN24101",
    course: "M.Sc. IT",
  },
  {
    id: "stu-7",
    name: "Ravi Kumar",
    rollNumber: "MSC24002",
    className: "M.Sc. IT I SEMESTER",
    section: "A",
    batch: "2024-26",
    enrollmentNo: "EN24102",
    course: "M.Sc. IT",
  },
  {
    id: "stu-8",
    name: "Monika Patel",
    rollNumber: "MSC24003",
    className: "M.Sc. IT II SEMESTER",
    section: "A",
    batch: "2023-25",
    enrollmentNo: "EN23101",
    course: "M.Sc. IT",
  },
];

export function useStudentStore() {
  const [students, setStudents] = useLocalStorage<Student[]>(
    "ftms-students",
    SAMPLE_STUDENTS,
  );

  const addStudents = (newStudents: Omit<Student, "id">[]) => {
    const withIds = newStudents.map((s, i) => ({
      ...s,
      id: `stu-${Date.now()}-${i}`,
    }));
    setStudents((prev) => [...prev, ...withIds]);
    return withIds.length;
  };

  const addStudent = (s: Omit<Student, "id">) => {
    const ns: Student = { ...s, id: `stu-${Date.now()}` };
    setStudents((prev) => [...prev, ns]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const getStudentsByClass = (className: string) =>
    students.filter((s) => s.className === className);

  const getStudentsByCourse = (course: string) =>
    students.filter((s) => s.course === course);

  return {
    students,
    addStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass,
    getStudentsByCourse,
  };
}
