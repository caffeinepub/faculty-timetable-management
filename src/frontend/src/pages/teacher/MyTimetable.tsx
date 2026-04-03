import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import { TimetableGrid } from "../../components/TimetableGrid";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { FacultyProfile } from "../../types/models";

interface MyTimetableProps {
  profile: FacultyProfile;
}

export function MyTimetable({ profile }: MyTimetableProps) {
  const { entries, subjects, rooms, batches } = useTimetableStore();
  const myEntries = entries.filter((e) => e.teacherId === profile.id);

  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const sortedEntries = [...myEntries].sort((a, b) => {
    const dA = dayOrder.indexOf(a.day);
    const dB = dayOrder.indexOf(b.day);
    if (dA !== dB) return dA - dB;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="teacher_timetable.page"
    >
      <div className="flex items-center gap-3 mb-2">
        <Calendar className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">मेरी समयसारणी / My Timetable</h2>
          <p className="text-xs text-muted-foreground">
            {myEntries.length} classes scheduled
          </p>
        </div>
      </div>

      {/* Grid view */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            साप्ताहिक दृश्य / Weekly View
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {myEntries.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="teacher_timetable.empty_state"
            >
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                कोई कक्षा निर्धारित नहीं / No classes scheduled
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <TimetableGrid entries={myEntries} teacherId={profile.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* List view */}
      <Card className="border-border shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            सूची दृश्य / List View
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2" data-ocid="teacher_timetable.list">
            {sortedEntries.map((entry, i) => {
              const subject = subjects.find((s) => s.id === entry.subjectId);
              const room = rooms.find((r) => r.id === entry.roomId);
              const batch = batches.find((b) => b.id === entry.batchId);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-3 bg-secondary rounded-lg"
                  data-ocid={`teacher_timetable.item.${i + 1}`}
                >
                  <div className="w-16 text-center">
                    <p className="text-xs font-semibold text-primary">
                      {entry.day.slice(0, 3)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.startTime}
                    </p>
                  </div>
                  <div className="w-1 h-10 rounded-full bg-primary/30" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {subject?.code} &mdash; {subject?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {room?.name} &bull; {batch?.name}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      {entry.startTime} - {entry.endTime}
                    </p>
                    <p className="capitalize">{entry.weekType} week</p>
                  </div>
                </div>
              );
            })}
            {sortedEntries.length === 0 && (
              <p
                className="text-center text-muted-foreground text-sm py-4"
                data-ocid="teacher_timetable_list.empty_state"
              >
                No scheduled classes
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
