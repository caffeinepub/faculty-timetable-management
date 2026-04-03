import { useLocalStorage } from "../hooks/useLocalStorage";

export interface Notice {
  id: string;
  title: string;
  titleHindi: string;
  content: string;
  contentHindi: string;
  postedBy: string;
  postedAt: string;
  isActive: boolean;
  priority: "Normal" | "Important" | "Urgent";
  targetRole?: "all" | "teacher" | "checker";
}

const today = new Date();
const d = (days: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - days);
  return dt.toISOString();
};

const SAMPLE_NOTICES: Notice[] = [
  {
    id: "notice-1",
    title: "Mid-Semester Examination Schedule",
    titleHindi: "अर्धवार्षिक परीक्षा समय-सारणी",
    content:
      "Mid-semester examinations are scheduled from the 3rd week of the current month. Faculty are requested to complete course syllabus coverage by then. Please submit examination question papers at least 5 days in advance.",
    contentHindi:
      "अर्धवार्षिक परीक्षाएं इस माह के तीसरे सप्ताह से निर्धारित हैं। शिक्षकों से अनुरोध है कि तब तक पाठ्यक्रम पूरा करें। परीक्षा प्रश्न पत्र कम से कम 5 दिन पहले जमा करें।",
    postedBy: "Admin",
    postedAt: d(2),
    isActive: true,
    priority: "Important",
    targetRole: "all",
  },
  {
    id: "notice-2",
    title: "Bill Submission Deadline — This Month",
    titleHindi: "बिल जमा करने की अंतिम तिथि — इस माह",
    content:
      "All faculty members are reminded to submit their monthly bills by the 25th of every month. Bills submitted after the deadline will be processed in the next billing cycle. Please ensure all supporting documents are attached.",
    contentHindi:
      "सभी शिक्षकों को याद दिलाया जाता है कि हर माह की 25 तारीख तक मासिक बिल जमा करें। अंतिम तिथि के बाद जमा बिल अगले चक्र में संसाधित होंगे।",
    postedBy: "Admin",
    postedAt: d(5),
    isActive: true,
    priority: "Urgent",
    targetRole: "teacher",
  },
  {
    id: "notice-3",
    title: "Staff Development Workshop",
    titleHindi: "स्टाफ विकास कार्यशाला",
    content:
      "A two-day staff development workshop on modern pedagogy and digital teaching methods will be held on the last weekend of this month. All teaching staff are encouraged to participate. Registration details will be shared shortly.",
    contentHindi:
      "आधुनिक शिक्षण विधियों पर दो दिवसीय कार्यशाला इस माह के अंतिम सप्ताहांत में आयोजित होगी। सभी शिक्षकों को भाग लेने के लिए प्रोत्साहित किया जाता है।",
    postedBy: "Admin",
    postedAt: d(7),
    isActive: true,
    priority: "Normal",
    targetRole: "teacher",
  },
];

export function useNoticeBoardStore() {
  const [notices, setNotices] = useLocalStorage<Notice[]>(
    "ftms_notices",
    SAMPLE_NOTICES,
  );

  const addNotice = (notice: Omit<Notice, "id" | "postedAt">) => {
    const newNotice: Notice = {
      ...notice,
      id: `notice-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      postedAt: new Date().toISOString(),
    };
    setNotices((prev) => [newNotice, ...prev]);
    return newNotice;
  };

  const updateNotice = (id: string, updates: Partial<Notice>) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    );
  };

  const deleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleActive = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isActive: !n.isActive } : n)),
    );
  };

  const getActiveNotices = (role?: "teacher" | "checker") =>
    notices.filter(
      (n) =>
        n.isActive &&
        (!n.targetRole || n.targetRole === "all" || n.targetRole === role),
    );

  return {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    toggleActive,
    getActiveNotices,
  };
}
