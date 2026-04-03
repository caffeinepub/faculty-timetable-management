import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useCourseStore } from "../store/useCourseStore";
import { useTimetableStore } from "../store/useTimetableStore";
import type { DayOfWeek, TimetableEntry } from "../types/models";

const DAYS: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8AM to 6PM

const BLOCK_COLORS = [
  "bg-teal-mint/80 border-teal-DEFAULT/40 text-teal-dark",
  "bg-blue-100 border-blue-300/60 text-blue-700",
  "bg-mustard/60 border-mustard/40 text-amber-800",
  "bg-teal-dark/20 border-teal-dark/40 text-teal-dark",
  "bg-purple-100 border-purple-300/60 text-purple-700",
  "bg-orange-100 border-orange-300/60 text-orange-700",
];

interface TimetableGridProps {
  entries: TimetableEntry[];
  teacherId?: string;
  compact?: boolean;
  onEntryClick?: (entry: TimetableEntry) => void;
}

export function TimetableGrid({
  entries,
  teacherId: _teacherId,
  compact = false,
  onEntryClick,
}: TimetableGridProps) {
  const { subjects, rooms, batches } = useTimetableStore();
  const { courses } = useCourseStore();

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m ?? 0);
  };

  const entryColorMap = useMemo(() => {
    const map: Record<string, number> = {};
    let idx = 0;
    for (const e of entries) {
      if (!(e.subjectId in map)) {
        map[e.subjectId] = idx % BLOCK_COLORS.length;
        idx++;
      }
    }
    return map;
  }, [entries]);

  const displayDays = compact ? DAYS.slice(0, 5) : DAYS;

  const getEntriesForCell = (day: DayOfWeek) =>
    entries.filter((e) => e.day === day);

  return (
    <div className="overflow-auto">
      <div
        className="grid min-w-[600px]"
        style={{
          gridTemplateColumns: `80px repeat(${displayDays.length}, 1fr)`,
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-secondary/80 backdrop-blur z-10 border-b border-r border-border px-2 py-2 text-xs font-semibold text-muted-foreground">
          Time
        </div>
        {displayDays.map((day) => (
          <div
            key={day}
            className="sticky top-0 bg-secondary/80 backdrop-blur z-10 border-b border-r border-border px-2 py-2 text-xs font-semibold text-foreground text-center"
          >
            {day.slice(0, 3)}
          </div>
        ))}

        {/* Rows */}
        {HOURS.map((hour) => (
          <>
            {/* Time label */}
            <div
              key={`time-${hour}`}
              className="border-b border-r border-border px-2 py-1 text-xs text-muted-foreground font-medium"
              style={{ minHeight: compact ? 48 : 64 }}
            >
              {hour}:00
            </div>

            {/* Day cells */}
            {displayDays.map((day) => {
              const cellEntries = getEntriesForCell(day).filter((e) => {
                const start = timeToMinutes(e.startTime);
                return Math.floor(start / 60) === hour;
              });

              return (
                <div
                  key={`${day}-${hour}`}
                  className="border-b border-r border-border p-1 relative"
                  style={{ minHeight: compact ? 48 : 64 }}
                >
                  {cellEntries.map((entry) => {
                    const subject = subjects.find(
                      (s) => s.id === entry.subjectId,
                    );
                    const room = rooms.find((r) => r.id === entry.roomId);
                    const batch = batches.find((b) => b.id === entry.batchId);
                    const course = entry.courseId
                      ? courses.find((c) => c.id === entry.courseId)
                      : null;
                    const colorClass =
                      BLOCK_COLORS[entryColorMap[entry.subjectId] ?? 0];
                    const durationHours =
                      (timeToMinutes(entry.endTime) -
                        timeToMinutes(entry.startTime)) /
                      60;

                    return (
                      <button
                        type="button"
                        key={entry.id}
                        onClick={() => onEntryClick?.(entry)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && onEntryClick?.(entry)
                        }
                        className={cn(
                          "rounded-md border px-2 py-1 text-[10px] leading-tight cursor-pointer w-full text-left",
                          "hover:brightness-95 transition-all",
                          colorClass,
                        )}
                        style={{
                          height: compact
                            ? `${durationHours * 44}px`
                            : `${durationHours * 58}px`,
                        }}
                        title={`${subject?.name} — ${room?.name} — ${batch?.name}${
                          course ? ` — ${course.name}` : ""
                        }`}
                      >
                        <div className="font-semibold truncate">
                          {subject?.code ?? "—"}
                        </div>
                        {!compact && (
                          <>
                            <div className="truncate opacity-80">
                              {room?.name}
                            </div>
                            <div className="truncate opacity-70">
                              {batch?.name}
                            </div>
                            {course && (
                              <div className="truncate opacity-60 text-[9px] font-medium mt-0.5">
                                {course.name}
                              </div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
