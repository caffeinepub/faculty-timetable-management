import { useLocalStorage } from "../hooks/useLocalStorage";

export interface Department {
  id: string;
  name: string;
  nameHindi: string;
  designations: string[];
}

const SAMPLE_DEPARTMENTS: Department[] = [
  {
    id: "dept-cs",
    name: "Computer Science",
    nameHindi: "कंप्यूटर विज्ञान",
    designations: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ],
  },
  {
    id: "dept-it",
    name: "Information Technology",
    nameHindi: "सूचना प्रौद्योगिकी",
    designations: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ],
  },
  {
    id: "dept-mat",
    name: "Mathematics",
    nameHindi: "गणित",
    designations: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ],
  },
  {
    id: "dept-phy",
    name: "Physics",
    nameHindi: "भौतिक विज्ञान",
    designations: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Guest Faculty",
    ],
  },
  {
    id: "dept-eng",
    name: "English",
    nameHindi: "अंग्रेज़ी",
    designations: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ],
  },
  {
    id: "dept-com",
    name: "Commerce",
    nameHindi: "वाणिज्य",
    designations: [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
    ],
  },
];

export function useDepartmentStore() {
  const [departments, setDepartments] = useLocalStorage<Department[]>(
    "ftms_departments",
    SAMPLE_DEPARTMENTS,
  );

  const getDepartmentById = (id: string) =>
    departments.find((d) => d.id === id) ?? null;

  const addDepartment = (dept: Omit<Department, "id">) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    setDepartments((prev) => [...prev, newDept]);
    return newDept;
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    );
  };

  const deleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  return {
    departments,
    getDepartmentById,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  };
}
