import { useLocalStorage } from "../hooks/useLocalStorage";
import type { BillStatus, DailyClassBill, RtgsPayment } from "../types/models";

export const RATE_PER_HOUR = 800;
export const TDS_RATE = 0.1; // 10% TDS always applied

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const d = (days: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - days);
  return fmt(dt);
};

const SAMPLE_BILLS: DailyClassBill[] = [
  {
    id: "bill-1",
    teacherId: "teacher-1",
    date: d(1),
    subjectId: "sub-1",
    batchId: "batch-1",
    hoursTaught: 2,
    ratePerHour: 800,
    totalAmount: 1600,
    status: "Approved",
    checkerComment: "Verified attendance records.",
    adminComment: "Approved for payment.",
    checkedBy: "checker-1",
    approvedBy: "demo-admin",
    checkedAt: d(0),
    approvedAt: d(0),
    createdAt: d(1),
  },
  {
    id: "bill-2",
    teacherId: "teacher-2",
    date: d(2),
    subjectId: "sub-3",
    batchId: "batch-3",
    hoursTaught: 3,
    ratePerHour: 800,
    totalAmount: 2400,
    status: "Checked",
    checkerComment: "Attendance verified.",
    checkedBy: "checker-1",
    checkedAt: d(1),
    createdAt: d(2),
  },
  {
    id: "bill-3",
    teacherId: "teacher-1",
    date: d(3),
    subjectId: "sub-2",
    batchId: "batch-2",
    hoursTaught: 2,
    ratePerHour: 800,
    totalAmount: 1600,
    status: "Submitted",
    createdAt: d(3),
  },
  {
    id: "bill-4",
    teacherId: "teacher-3",
    date: d(4),
    subjectId: "sub-4",
    batchId: "batch-1",
    hoursTaught: 1,
    ratePerHour: 800,
    totalAmount: 800,
    status: "Draft",
    createdAt: d(4),
  },
  {
    id: "bill-5",
    teacherId: "teacher-2",
    date: d(5),
    subjectId: "sub-5",
    batchId: "batch-4",
    hoursTaught: 2,
    ratePerHour: 800,
    totalAmount: 1600,
    status: "Rejected",
    checkerComment: "Attendance records do not match.",
    checkedBy: "checker-1",
    checkedAt: d(4),
    createdAt: d(5),
  },
];

/** Always apply 10% TDS on gross amount */
export function calcTds(gross: number) {
  return Math.round(gross * TDS_RATE);
}

export function calcNet(gross: number) {
  return gross - calcTds(gross);
}

export function useBillingStore() {
  const [bills, setBills] = useLocalStorage<DailyClassBill[]>(
    "ftms_bills",
    SAMPLE_BILLS,
  );
  const [payments, setPayments] = useLocalStorage<RtgsPayment[]>(
    "ftms_payments",
    [],
  );

  const getBillsByTeacher = (teacherId: string) =>
    bills.filter((b) => b.teacherId === teacherId);

  const getSubmittedBills = () => bills.filter((b) => b.status === "Submitted");

  const getCheckedBills = () => bills.filter((b) => b.status === "Checked");

  const getApprovedBills = () => bills.filter((b) => b.status === "Approved");

  const addBill = (bill: Omit<DailyClassBill, "id" | "createdAt">) => {
    const newBill: DailyClassBill = {
      ...bill,
      id: `bill-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBills((prev) => [...prev, newBill]);
    return newBill;
  };

  const updateBillStatus = (
    id: string,
    status: BillStatus,
    extras?: {
      checkerComment?: string;
      adminComment?: string;
      checkedBy?: string;
      approvedBy?: string;
    },
  ) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          status,
          ...extras,
          ...(status === "Checked" || status === "Rejected"
            ? { checkedAt: new Date().toISOString() }
            : {}),
          ...(status === "Approved"
            ? { approvedAt: new Date().toISOString() }
            : {}),
        };
      }),
    );
  };

  const updateBill = (id: string, updates: Partial<DailyClassBill>) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const calculateMonthlyEarnings = (
    teacherId: string,
    year: number,
    month: number,
  ) => {
    const filtered = bills.filter((b) => {
      if (b.teacherId !== teacherId || b.status !== "Approved") return false;
      const dt = new Date(b.date);
      return dt.getFullYear() === year && dt.getMonth() + 1 === month;
    });
    const gross = filtered.reduce((s, b) => s + b.totalAmount, 0);
    const tds = calcTds(gross); // Always 10%
    return { gross, tds, net: gross - tds, bills: filtered };
  };

  const addPayment = (payment: Omit<RtgsPayment, "id">) => {
    const newPayment: RtgsPayment = { ...payment, id: `pay-${Date.now()}` };
    setPayments((prev) => [...prev, newPayment]);
    return newPayment;
  };

  return {
    bills,
    payments,
    getBillsByTeacher,
    getSubmittedBills,
    getCheckedBills,
    getApprovedBills,
    addBill,
    updateBillStatus,
    updateBill,
    deleteBill,
    calculateMonthlyEarnings,
    addPayment,
  };
}
