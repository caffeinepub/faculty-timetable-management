import { useLocalStorage } from "../hooks/useLocalStorage";

export interface ReviewCycle {
  id: string;
  title: string;
  year: number;
  semester: "odd" | "even";
  startDate: string;
  endDate: string;
  status: "Active" | "Closed";
  createdAt: string;
}

export interface FacultyReview {
  id: string;
  cycleId: string;
  teacherId: string;
  teacherName: string;
  scores: {
    teaching: number;
    punctuality: number;
    research: number;
    studentFeedback: number;
    administrativeDuties: number;
  };
  overallScore: number;
  remarks: string;
  reviewedBy: string;
  reviewedAt: string;
}

const SAMPLE_CYCLES: ReviewCycle[] = [
  {
    id: "cycle-1",
    title: "Annual Review 2025-26 (Odd Semester)",
    year: 2025,
    semester: "odd",
    startDate: "2025-07-01",
    endDate: "2025-11-30",
    status: "Closed",
    createdAt: "2025-07-01T08:00:00Z",
  },
  {
    id: "cycle-2",
    title: "Annual Review 2025-26 (Even Semester)",
    year: 2026,
    semester: "even",
    startDate: "2026-01-01",
    endDate: "2026-05-31",
    status: "Active",
    createdAt: "2026-01-01T08:00:00Z",
  },
];

const SAMPLE_REVIEWS: FacultyReview[] = [
  {
    id: "rev-1",
    cycleId: "cycle-1",
    teacherId: "cred_teacher1",
    teacherName: "Dr. Ramesh Sharma",
    scores: {
      teaching: 9,
      punctuality: 8,
      research: 7,
      studentFeedback: 9,
      administrativeDuties: 7,
    },
    overallScore: 8.0,
    remarks: "Excellent performance in teaching and student engagement.",
    reviewedBy: "admin",
    reviewedAt: "2025-12-01T10:00:00Z",
  },
  {
    id: "rev-2",
    cycleId: "cycle-1",
    teacherId: "cred_teacher2",
    teacherName: "Prof. Sunita Verma",
    scores: {
      teaching: 7,
      punctuality: 6,
      research: 8,
      studentFeedback: 7,
      administrativeDuties: 6,
    },
    overallScore: 6.8,
    remarks: "Good researcher. Needs improvement in punctuality.",
    reviewedBy: "admin",
    reviewedAt: "2025-12-02T11:00:00Z",
  },
  {
    id: "rev-3",
    cycleId: "cycle-2",
    teacherId: "cred_teacher1",
    teacherName: "Dr. Ramesh Sharma",
    scores: {
      teaching: 9,
      punctuality: 9,
      research: 8,
      studentFeedback: 9,
      administrativeDuties: 8,
    },
    overallScore: 8.6,
    remarks: "Consistently excellent. Keep up the great work!",
    reviewedBy: "admin",
    reviewedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "rev-4",
    cycleId: "cycle-2",
    teacherId: "cred_teacher3",
    teacherName: "Mr. Anil Meena",
    scores: {
      teaching: 5,
      punctuality: 4,
      research: 4,
      studentFeedback: 5,
      administrativeDuties: 5,
    },
    overallScore: 4.6,
    remarks: "Needs significant improvement in teaching methods and research.",
    reviewedBy: "admin",
    reviewedAt: "2026-03-16T09:00:00Z",
  },
];

function computeOverall(scores: FacultyReview["scores"]): number {
  const vals = Object.values(scores);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg * 10) / 10;
}

export function usePerformanceStore() {
  const [cycles, setCycles] = useLocalStorage<ReviewCycle[]>(
    "ftms-review-cycles",
    SAMPLE_CYCLES,
  );
  const [reviews, setReviews] = useLocalStorage<FacultyReview[]>(
    "ftms-faculty-reviews",
    SAMPLE_REVIEWS,
  );

  const addCycle = (cycle: Omit<ReviewCycle, "id" | "createdAt">) => {
    const newCycle: ReviewCycle = {
      ...cycle,
      id: `cycle-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCycles((prev) => [...prev, newCycle]);
    return newCycle;
  };

  const updateCycle = (id: string, updates: Partial<ReviewCycle>) => {
    setCycles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const deleteCycle = (id: string) => {
    setCycles((prev) => prev.filter((c) => c.id !== id));
    setReviews((prev) => prev.filter((r) => r.cycleId !== id));
  };

  const addReview = (review: Omit<FacultyReview, "id" | "overallScore">) => {
    const overallScore = computeOverall(review.scores);
    const newReview: FacultyReview = {
      ...review,
      id: `rev-${Date.now()}`,
      overallScore,
    };
    setReviews((prev) => [...prev, newReview]);
    return newReview;
  };

  const updateReview = (
    id: string,
    updates: Partial<Omit<FacultyReview, "overallScore">>,
  ) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };
        if (updates.scores) {
          updated.overallScore = computeOverall(updates.scores);
        }
        return updated;
      }),
    );
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const getReviewsByTeacher = (teacherId: string) =>
    reviews.filter((r) => r.teacherId === teacherId);

  const getReviewsByCycle = (cycleId: string) =>
    reviews.filter((r) => r.cycleId === cycleId);

  const getAverageScore = (teacherId: string): number => {
    const teacherReviews = reviews.filter((r) => r.teacherId === teacherId);
    if (teacherReviews.length === 0) return 0;
    const avg =
      teacherReviews.reduce((s, r) => s + r.overallScore, 0) /
      teacherReviews.length;
    return Math.round(avg * 10) / 10;
  };

  const getActiveCycles = () => cycles.filter((c) => c.status === "Active");

  return {
    cycles,
    reviews,
    addCycle,
    updateCycle,
    deleteCycle,
    addReview,
    updateReview,
    deleteReview,
    getReviewsByTeacher,
    getReviewsByCycle,
    getAverageScore,
    getActiveCycles,
  };
}
