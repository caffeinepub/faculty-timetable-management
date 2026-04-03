import { useLocalStorage } from "../hooks/useLocalStorage";
import type { CalendarEvent } from "../types/models";

const now = new Date();
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const fmt = (d: Date) => d.toISOString().split("T")[0];

const dateOf = (month: Date, day: number) => {
  return fmt(new Date(month.getFullYear(), month.getMonth(), day));
};

const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "Republic Day",
    titleHindi: "गणतंत्र दिवस",
    description:
      "National holiday - Republic Day celebration at the institution.",
    date: dateOf(now, 26),
    type: "Holiday",
    createdBy: "demo-admin",
  },
  {
    id: "cal-2",
    title: "Mid-Semester Exam - BCA Sem I",
    titleHindi: "अर्द्ध सत्र परीक्षा - BCA प्रथम",
    description: "Mid-semester examinations for BCA Semester I students.",
    date: dateOf(now, Math.min(now.getDate() + 5, 28)),
    endDate: dateOf(now, Math.min(now.getDate() + 8, 28)),
    type: "Exam",
    createdBy: "demo-admin",
  },
  {
    id: "cal-3",
    title: "Faculty Meeting",
    titleHindi: "शिक्षक बैठक",
    description: "Monthly faculty meeting to discuss curriculum and progress.",
    date: dateOf(now, Math.min(now.getDate() + 2, 28)),
    type: "Meeting",
    createdBy: "demo-admin",
  },
  {
    id: "cal-4",
    title: "Annual Sports Day",
    titleHindi: "वार्षिक खेल दिवस",
    description: "Annual sports event for students and staff.",
    date: dateOf(now, Math.min(now.getDate() + 12, 28)),
    type: "Event",
    createdBy: "demo-admin",
  },
  {
    id: "cal-5",
    title: "Bill Submission Deadline",
    titleHindi: "बिल जमा करने की अंतिम तिथि",
    description: "Last date for faculty to submit monthly class bills.",
    date: dateOf(now, 5),
    type: "Deadline",
    createdBy: "demo-admin",
  },
  {
    id: "cal-6",
    title: "Holi - Holiday",
    titleHindi: "होली - अवकाश",
    description: "Institution closed for Holi festival.",
    date: dateOf(nextMonth, 14),
    type: "Holiday",
    createdBy: "demo-admin",
  },
  {
    id: "cal-7",
    title: "Final Exam Schedule Release",
    titleHindi: "अंतिम परीक्षा कार्यक्रम जारी",
    description: "Final semester examination timetable to be published.",
    date: dateOf(nextMonth, 10),
    type: "Deadline",
    createdBy: "demo-admin",
  },
  {
    id: "cal-8",
    title: "Orientation Program",
    titleHindi: "ओरिएंटेशन कार्यक्रम",
    description: "Orientation for new students joining the institution.",
    date: dateOf(nextMonth, 3),
    type: "Event",
    createdBy: "demo-admin",
  },
];

export function useCalendarStore() {
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>(
    "ftms_calendar",
    SAMPLE_EVENTS,
  );

  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `cal-${Date.now()}`,
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const getEventsByMonth = (year: number, month: number) =>
    events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

  const getUpcomingEvents = (n = 3) => {
    const today = new Date().toISOString().split("T")[0];
    return [...events]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, n);
  };

  return {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    getEventsByMonth,
    getUpcomingEvents,
  };
}
