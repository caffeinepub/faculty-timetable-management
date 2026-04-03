import { useLocalStorage } from "../hooks/useLocalStorage";

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  course: string;
  feeType: "Tuition" | "Exam" | "Library" | "Other";
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "Pending" | "Paid" | "Overdue";
  receiptNo?: string;
  paymentMode?: "Cash" | "Online" | "Cheque";
  remarks?: string;
}

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
const subDays = (d: Date, n: number) => new Date(d.getTime() - n * 86400000);

const SAMPLE_FEES: FeeRecord[] = [
  {
    id: "fee-1",
    studentId: "stu-1",
    studentName: "Rahul Sharma",
    rollNumber: "BCA24001",
    className: "BCA SEMESTER I",
    course: "BCA",
    feeType: "Tuition",
    amount: 25000,
    dueDate: fmt(subDays(today, 10)),
    paidDate: fmt(subDays(today, 12)),
    status: "Paid",
    receiptNo: "REC-001",
    paymentMode: "Online",
  },
  {
    id: "fee-2",
    studentId: "stu-2",
    studentName: "Priya Gupta",
    rollNumber: "BCA24002",
    className: "BCA SEMESTER I",
    course: "BCA",
    feeType: "Tuition",
    amount: 25000,
    dueDate: fmt(subDays(today, 5)),
    status: "Overdue",
  },
  {
    id: "fee-3",
    studentId: "stu-3",
    studentName: "Anil Meena",
    rollNumber: "BCA24003",
    className: "BCA SEMESTER I",
    course: "BCA",
    feeType: "Exam",
    amount: 1500,
    dueDate: fmt(addDays(today, 7)),
    status: "Pending",
  },
  {
    id: "fee-4",
    studentId: "stu-4",
    studentName: "Sunita Joshi",
    rollNumber: "BCA24004",
    className: "BCA SEMESTER II",
    course: "BCA",
    feeType: "Tuition",
    amount: 25000,
    dueDate: fmt(subDays(today, 3)),
    paidDate: fmt(subDays(today, 4)),
    status: "Paid",
    receiptNo: "REC-002",
    paymentMode: "Cash",
  },
  {
    id: "fee-5",
    studentId: "stu-5",
    studentName: "Deepak Yadav",
    rollNumber: "BCA24005",
    className: "BCA SEMESTER II",
    course: "BCA",
    feeType: "Library",
    amount: 500,
    dueDate: fmt(subDays(today, 15)),
    status: "Overdue",
  },
  {
    id: "fee-6",
    studentId: "stu-6",
    studentName: "Kavita Singh",
    rollNumber: "MSC24001",
    className: "M.Sc. IT I SEMESTER",
    course: "M.Sc. IT",
    feeType: "Tuition",
    amount: 35000,
    dueDate: fmt(addDays(today, 14)),
    paidDate: fmt(subDays(today, 1)),
    status: "Paid",
    receiptNo: "REC-003",
    paymentMode: "Cheque",
  },
  {
    id: "fee-7",
    studentId: "stu-7",
    studentName: "Ravi Kumar",
    rollNumber: "MSC24002",
    className: "M.Sc. IT I SEMESTER",
    course: "M.Sc. IT",
    feeType: "Exam",
    amount: 2000,
    dueDate: fmt(addDays(today, 3)),
    status: "Pending",
  },
  {
    id: "fee-8",
    studentId: "stu-8",
    studentName: "Monika Patel",
    rollNumber: "MSC24003",
    className: "M.Sc. IT II SEMESTER",
    course: "M.Sc. IT",
    feeType: "Other",
    amount: 800,
    dueDate: fmt(subDays(today, 20)),
    status: "Overdue",
    remarks: "Sports fee unpaid",
  },
];

export function useFeeStore() {
  const [records, setRecords] = useLocalStorage<FeeRecord[]>(
    "ftms-fee-records",
    SAMPLE_FEES,
  );

  const addRecord = (rec: Omit<FeeRecord, "id">) => {
    const newRec: FeeRecord = { ...rec, id: `fee-${Date.now()}` };
    setRecords((prev) => [...prev, newRec]);
    return newRec;
  };

  const updateRecord = (id: string, updates: Partial<FeeRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const markAsPaid = (
    id: string,
    receiptNo: string,
    paymentMode: FeeRecord["paymentMode"],
  ) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Paid" as const,
              paidDate: new Date().toISOString().split("T")[0],
              receiptNo,
              paymentMode,
            }
          : r,
      ),
    );
  };

  const getDefaulters = () =>
    records.filter((r) => r.status === "Overdue" || r.status === "Pending");

  const getByStudent = (studentId: string) =>
    records.filter((r) => r.studentId === studentId);

  const getByClass = (className: string) =>
    records.filter((r) => r.className === className);

  const getTotalCollected = () =>
    records
      .filter((r) => r.status === "Paid")
      .reduce((s, r) => s + r.amount, 0);

  const getTotalPending = () =>
    records
      .filter((r) => r.status !== "Paid")
      .reduce((s, r) => s + r.amount, 0);

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    markAsPaid,
    getDefaulters,
    getByStudent,
    getByClass,
    getTotalCollected,
    getTotalPending,
  };
}
