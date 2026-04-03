import { useLocalStorage } from "../hooks/useLocalStorage";
import type {
  Batch,
  DayOfWeek,
  Room,
  Semester,
  Subject,
  TimetableEntry,
} from "../types/models";

const SAMPLE_SEMESTERS: Semester[] = [
  {
    id: "sem-1",
    name: "BCA Semester I",
    program: "BCA",
    semesterNumber: 1,
    isActive: true,
  },
  {
    id: "sem-2",
    name: "BCA Semester II",
    program: "BCA",
    semesterNumber: 2,
    isActive: true,
  },
  {
    id: "sem-3",
    name: "M.Sc. IT Semester I",
    program: "M.Sc. IT",
    semesterNumber: 1,
    isActive: true,
  },
];

const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: "sub-1",
    code: "CS-101",
    name: "Introduction to Programming",
    type: "Theory",
    semesterId: "sem-1",
    creditHours: 4,
  },
  {
    id: "sub-2",
    code: "CS-101P",
    name: "Programming Lab",
    type: "Practical",
    semesterId: "sem-1",
    creditHours: 2,
  },
  {
    id: "sub-3",
    code: "CS-201",
    name: "Data Structures",
    type: "Theory",
    semesterId: "sem-2",
    creditHours: 4,
  },
  {
    id: "sub-4",
    code: "MA-101",
    name: "Mathematics I",
    type: "Theory",
    semesterId: "sem-1",
    creditHours: 3,
  },
  {
    id: "sub-5",
    code: "IT-301",
    name: "Advanced Algorithms",
    type: "Theory",
    semesterId: "sem-3",
    creditHours: 4,
  },
  {
    id: "sub-6",
    code: "IT-302",
    name: "Database Systems",
    type: "Theory",
    semesterId: "sem-3",
    creditHours: 4,
  },
];

const SAMPLE_ROOMS: Room[] = [
  {
    id: "room-1",
    name: "Room 101",
    capacity: 60,
    type: "Classroom",
    isActive: true,
  },
  {
    id: "room-2",
    name: "Room 202",
    capacity: 60,
    type: "Classroom",
    isActive: true,
  },
  { id: "room-3", name: "Lab A", capacity: 30, type: "Lab", isActive: true },
  { id: "room-4", name: "Lab B", capacity: 30, type: "Lab", isActive: true },
];

const SAMPLE_BATCHES: Batch[] = [
  { id: "batch-1", name: "BCA-I-A", semesterId: "sem-1", strength: 60 },
  {
    id: "batch-2",
    name: "BCA-I-Lab1",
    semesterId: "sem-1",
    parentBatchId: "batch-1",
    strength: 30,
  },
  { id: "batch-3", name: "BCA-II-A", semesterId: "sem-2", strength: 55 },
  { id: "batch-4", name: "MSC-IT-I", semesterId: "sem-3", strength: 40 },
];

const SAMPLE_ENTRIES: TimetableEntry[] = [
  {
    id: "entry-1",
    subjectId: "sub-1",
    teacherId: "teacher-1",
    roomId: "room-1",
    batchId: "batch-1",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    weekType: "all",
  },
  {
    id: "entry-2",
    subjectId: "sub-4",
    teacherId: "teacher-3",
    roomId: "room-2",
    batchId: "batch-1",
    day: "Monday",
    startTime: "10:00",
    endTime: "11:00",
    weekType: "all",
  },
  {
    id: "entry-3",
    subjectId: "sub-2",
    teacherId: "teacher-1",
    roomId: "room-3",
    batchId: "batch-2",
    day: "Tuesday",
    startTime: "09:00",
    endTime: "11:00",
    weekType: "all",
  },
  {
    id: "entry-4",
    subjectId: "sub-3",
    teacherId: "teacher-2",
    roomId: "room-1",
    batchId: "batch-3",
    day: "Monday",
    startTime: "11:00",
    endTime: "12:00",
    weekType: "all",
  },
  {
    id: "entry-5",
    subjectId: "sub-5",
    teacherId: "teacher-2",
    roomId: "room-2",
    batchId: "batch-4",
    day: "Wednesday",
    startTime: "14:00",
    endTime: "15:00",
    weekType: "all",
  },
  {
    id: "entry-6",
    subjectId: "sub-6",
    teacherId: "teacher-3",
    roomId: "room-1",
    batchId: "batch-4",
    day: "Thursday",
    startTime: "09:00",
    endTime: "10:00",
    weekType: "all",
  },
  {
    id: "entry-7",
    subjectId: "sub-1",
    teacherId: "teacher-1",
    roomId: "room-2",
    batchId: "batch-1",
    day: "Friday",
    startTime: "10:00",
    endTime: "11:00",
    weekType: "all",
  },
  {
    id: "entry-8",
    subjectId: "sub-4",
    teacherId: "teacher-3",
    roomId: "room-1",
    batchId: "batch-3",
    day: "Tuesday",
    startTime: "11:00",
    endTime: "12:00",
    weekType: "all",
  },
  {
    id: "entry-9",
    subjectId: "sub-3",
    teacherId: "teacher-2",
    roomId: "room-2",
    batchId: "batch-3",
    day: "Wednesday",
    startTime: "09:00",
    endTime: "10:00",
    weekType: "all",
  },
  {
    id: "entry-10",
    subjectId: "sub-6",
    teacherId: "teacher-3",
    roomId: "room-2",
    batchId: "batch-4",
    day: "Friday",
    startTime: "14:00",
    endTime: "15:00",
    weekType: "all",
  },
];

export function useTimetableStore() {
  const [semesters, setSemesters] = useLocalStorage<Semester[]>(
    "ftms_semesters",
    SAMPLE_SEMESTERS,
  );
  const [subjects, setSubjects] = useLocalStorage<Subject[]>(
    "ftms_subjects",
    SAMPLE_SUBJECTS,
  );
  const [rooms, setRooms] = useLocalStorage<Room[]>("ftms_rooms", SAMPLE_ROOMS);
  const [batches, setBatches] = useLocalStorage<Batch[]>(
    "ftms_batches",
    SAMPLE_BATCHES,
  );
  const [entries, setEntries] = useLocalStorage<TimetableEntry[]>(
    "ftms_entries",
    SAMPLE_ENTRIES,
  );

  // Clash detection
  const detectClash = (
    newEntry: Omit<TimetableEntry, "id">,
    excludeId?: string,
  ): string | null => {
    const existing = entries.filter(
      (e) => e.id !== excludeId && e.day === newEntry.day,
    );
    const overlaps = (
      a: { startTime: string; endTime: string },
      b: { startTime: string; endTime: string },
    ) => a.startTime < b.endTime && a.endTime > b.startTime;

    for (const e of existing) {
      if (!overlaps(e, newEntry)) continue;
      if (e.roomId === newEntry.roomId) {
        const room = rooms.find((r) => r.id === e.roomId);
        return `Room clash: ${room?.name ?? e.roomId} is already booked on ${newEntry.day} from ${e.startTime} to ${e.endTime}`;
      }
      if (e.teacherId === newEntry.teacherId) {
        return `Teacher clash: This teacher is already scheduled on ${newEntry.day} from ${e.startTime} to ${e.endTime}`;
      }
      if (e.batchId === newEntry.batchId) {
        const batch = batches.find((b) => b.id === e.batchId);
        return `Batch clash: ${batch?.name ?? e.batchId} already has a class on ${newEntry.day} from ${e.startTime} to ${e.endTime}`;
      }
    }
    return null;
  };

  const addEntry = (
    entry: Omit<TimetableEntry, "id">,
  ): { success: boolean; clash?: string } => {
    const clash = detectClash(entry);
    if (clash) return { success: false, clash };
    const newEntry: TimetableEntry = { ...entry, id: `entry-${Date.now()}` };
    setEntries((prev) => [...prev, newEntry]);
    return { success: true };
  };

  const updateEntry = (
    id: string,
    updates: Partial<TimetableEntry>,
  ): { success: boolean; clash?: string } => {
    const existing = entries.find((e) => e.id === id);
    if (!existing) return { success: false };
    const merged = { ...existing, ...updates };
    const clash = detectClash(merged, id);
    if (clash) return { success: false, clash };
    setEntries((prev) => prev.map((e) => (e.id === id ? merged : e)));
    return { success: true };
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const getEntriesForTeacher = (teacherId: string) =>
    entries.filter((e) => e.teacherId === teacherId);

  const getEntriesForDay = (day: DayOfWeek) =>
    entries.filter((e) => e.day === day);

  const addSemester = (sem: Omit<Semester, "id">) => {
    const newSem: Semester = { ...sem, id: `sem-${Date.now()}` };
    setSemesters((prev) => [...prev, newSem]);
    return newSem;
  };

  const addSubject = (sub: Omit<Subject, "id">) => {
    const newSub: Subject = { ...sub, id: `sub-${Date.now()}` };
    setSubjects((prev) => [...prev, newSub]);
    return newSub;
  };

  const addRoom = (room: Omit<Room, "id">) => {
    const newRoom: Room = { ...room, id: `room-${Date.now()}` };
    setRooms((prev) => [...prev, newRoom]);
    return newRoom;
  };

  const addBatch = (batch: Omit<Batch, "id">) => {
    const newBatch: Batch = { ...batch, id: `batch-${Date.now()}` };
    setBatches((prev) => [...prev, newBatch]);
    return newBatch;
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  };

  const updateSemester = (id: string, updates: Partial<Semester>) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  return {
    semesters,
    subjects,
    rooms,
    batches,
    entries,
    addEntry,
    updateEntry,
    removeEntry,
    detectClash,
    getEntriesForTeacher,
    getEntriesForDay,
    addSemester,
    addSubject,
    addRoom,
    addBatch,
    updateRoom,
    updateSemester,
    setSubjects,
    setSemesters,
    setRooms,
    setBatches,
  };
}
