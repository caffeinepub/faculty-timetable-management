import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Holiday } from "../types/models";

const DEFAULT_HOLIDAYS: Holiday[] = [
  {
    id: "hol-1",
    name: "Makar Sankranti",
    nameHindi: "मकर संक्रांति",
    date: "2026-01-14",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-2",
    name: "Republic Day",
    nameHindi: "गणतंत्र दिवस",
    date: "2026-01-26",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-3",
    name: "Maha Shivratri",
    nameHindi: "महा शिवरात्रि",
    date: "2026-02-26",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-4",
    name: "Holi",
    nameHindi: "होली",
    date: "2026-03-19",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-5",
    name: "Id-ul-Fitr",
    nameHindi: "ईद-उल-फितर",
    date: "2026-03-25",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-6",
    name: "Ram Navami",
    nameHindi: "राम नवमी",
    date: "2026-04-02",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-7",
    name: "Mahavir Jayanti",
    nameHindi: "महावीर जयंती",
    date: "2026-04-05",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-8",
    name: "Good Friday",
    nameHindi: "गुड फ्राइडे",
    date: "2026-04-06",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-9",
    name: "Ambedkar Jayanti",
    nameHindi: "अम्बेडकर जयंती",
    date: "2026-04-14",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-10",
    name: "Hanuman Jayanti",
    nameHindi: "हनुमान जयंती",
    date: "2026-04-26",
    type: "State",
    isActive: true,
  },
  {
    id: "hol-11",
    name: "Buddha Purnima",
    nameHindi: "बुद्ध पूर्णिमा",
    date: "2026-05-24",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-12",
    name: "Eid ul-Adha",
    nameHindi: "ईद उल-अज़हा",
    date: "2026-06-15",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-13",
    name: "Independence Day",
    nameHindi: "स्वतंत्रता दिवस",
    date: "2026-08-15",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-14",
    name: "Raksha Bandhan",
    nameHindi: "रक्षाबंधन",
    date: "2026-08-22",
    type: "State",
    isActive: true,
  },
  {
    id: "hol-15",
    name: "Janmashtami",
    nameHindi: "जन्माष्टमी",
    date: "2026-08-30",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-16",
    name: "Id-e-Milad",
    nameHindi: "ईद-ए-मिलाद",
    date: "2026-09-18",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-17",
    name: "Gandhi Jayanti",
    nameHindi: "गांधी जयंती",
    date: "2026-10-02",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-18",
    name: "Diwali",
    nameHindi: "दीपावली",
    date: "2026-10-20",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-19",
    name: "Diwali Day 2",
    nameHindi: "दीपावली (द्वितीय)",
    date: "2026-10-21",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-20",
    name: "Govardhan Puja",
    nameHindi: "गोवर्धन पूजा",
    date: "2026-10-22",
    type: "State",
    isActive: true,
  },
  {
    id: "hol-21",
    name: "Guru Nanak Jayanti",
    nameHindi: "गुरु नानक जयंती",
    date: "2026-11-05",
    type: "National",
    isActive: true,
  },
  {
    id: "hol-22",
    name: "Christmas",
    nameHindi: "क्रिसमस",
    date: "2026-12-25",
    type: "National",
    isActive: true,
  },
];

export function useHolidayStore() {
  const [holidays, setHolidays] = useLocalStorage<Holiday[]>(
    "ftms_holidays",
    DEFAULT_HOLIDAYS,
  );

  const addHoliday = (holiday: Omit<Holiday, "id">) => {
    const newHoliday: Holiday = { ...holiday, id: `hol-${Date.now()}` };
    setHolidays((prev) =>
      [...prev, newHoliday].sort((a, b) => a.date.localeCompare(b.date)),
    );
    return newHoliday;
  };

  const updateHoliday = (id: string, updates: Partial<Holiday>) => {
    setHolidays((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    );
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleActive = (id: string) => {
    setHolidays((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isActive: !h.isActive } : h)),
    );
  };

  const getActiveHolidays = () => holidays.filter((h) => h.isActive);

  const getHolidayDates = () =>
    holidays.filter((h) => h.isActive).map((h) => h.date);

  return {
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    toggleActive,
    getActiveHolidays,
    getHolidayDates,
  };
}
