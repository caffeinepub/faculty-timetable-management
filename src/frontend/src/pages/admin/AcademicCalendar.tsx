import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCalendarStore } from "../../store/useCalendarStore";
import type { CalendarEvent } from "../../types/models";

const EVENT_COLORS: Record<CalendarEvent["type"], string> = {
  Holiday: "bg-red-100 text-red-700 border-red-200",
  Exam: "bg-orange-100 text-orange-700 border-orange-200",
  Meeting: "bg-blue-100 text-blue-700 border-blue-200",
  Event: "bg-green-100 text-green-700 border-green-200",
  Deadline: "bg-purple-100 text-purple-700 border-purple-200",
};

const DOT_COLORS: Record<CalendarEvent["type"], string> = {
  Holiday: "bg-red-500",
  Exam: "bg-orange-500",
  Meeting: "bg-blue-500",
  Event: "bg-green-500",
  Deadline: "bg-purple-500",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AcademicCalendar() {
  const { events, addEvent, removeEvent } = useCalendarStore();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [addDialog, setAddDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    eventId: string;
    title: string;
  }>({ open: false, eventId: "", title: "" });

  const [form, setForm] = useState<{
    title: string;
    titleHindi: string;
    description: string;
    date: string;
    endDate: string;
    type: CalendarEvent["type"];
  }>({
    title: "",
    titleHindi: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    endDate: "",
    type: "Event",
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStr = new Date().toISOString().split("T")[0];

  const monthEvents = useMemo(
    () =>
      events.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      }),
    [events, year, month],
  );

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => {
      const start = e.date;
      const end = e.endDate ?? e.date;
      return dateStr >= start && dateStr <= end;
    });
  };

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => {
      const end = e.endDate ?? e.date;
      return selectedDate >= e.date && selectedDate <= end;
    });
  }, [events, selectedDate]);

  const handleAdd = () => {
    if (!form.title || !form.date) {
      toast.error("Title and date are required");
      return;
    }
    addEvent({
      title: form.title,
      titleHindi: form.titleHindi,
      description: form.description || undefined,
      date: form.date,
      endDate: form.endDate || undefined,
      type: form.type,
      createdBy: "demo-admin",
    });
    toast.success("Event added / इवेंट जोड़ा गया");
    setAddDialog(false);
    setForm({
      title: "",
      titleHindi: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      endDate: "",
      type: "Event",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="calendar.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Academic Calendar</h2>
          <p className="text-xs text-muted-foreground">शैक्षिक कैलेंडर</p>
        </div>
        <Button
          size="sm"
          onClick={() => setAddDialog(true)}
          data-ocid="calendar.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(EVENT_COLORS) as CalendarEvent["type"][]).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[type]}`} />
            <span className="text-xs text-muted-foreground">{type}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <Card className="border-border shadow-card">
            <CardContent className="p-4">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1),
                    )
                  }
                  data-ocid="calendar.pagination_prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-bold text-base">
                  {MONTHS[month]} {year}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1),
                    )
                  }
                  data-ocid="calendar.pagination_next"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold text-muted-foreground py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {["s0", "s1", "s2", "s3", "s4", "s5", "s6"]
                  .slice(0, firstDay)
                  .map((key) => (
                    <div
                      key={`spacer-${year}-${month}-${key}`}
                      aria-hidden="true"
                    />
                  ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayEvents = getEventsForDay(day);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setSelectedDate(isSelected ? null : dateStr)
                        }
                        className={`min-h-[54px] p-1 rounded-md text-left border transition-all hover:border-primary/50 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : isToday
                              ? "border-primary/40 bg-primary/5"
                              : "border-border"
                        }`}
                        data-ocid="calendar.day.button"
                      >
                        <div
                          className={`text-[11px] font-semibold mb-0.5 ${
                            isToday ? "text-primary" : ""
                          }`}
                        >
                          {day}
                        </div>
                        <div className="flex flex-wrap gap-0.5">
                          {dayEvents.slice(0, 3).map((e) => (
                            <div
                              key={e.id}
                              className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[e.type]}`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event list */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">
            {selectedDate
              ? `Events on ${new Date(selectedDate).toLocaleDateString("en-IN")}`
              : `Events in ${MONTHS[month]}`}
          </h3>
          {(selectedDate ? selectedEvents : monthEvents).length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="calendar.empty_state"
            >
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">कोई इवेंट नहीं / No events</p>
            </div>
          ) : (
            (selectedDate ? selectedEvents : monthEvents)
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((evt, i) => (
                <Card
                  key={evt.id}
                  className="border-border shadow-card"
                  data-ocid={`calendar.event.item.${i + 1}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${EVENT_COLORS[evt.type]}`}
                          >
                            {evt.type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(evt.date).toLocaleDateString("en-IN")}
                            {evt.endDate &&
                              evt.endDate !== evt.date &&
                              ` — ${new Date(evt.endDate).toLocaleDateString("en-IN")}`}
                          </span>
                        </div>
                        <p className="text-sm font-semibold mt-1">
                          {evt.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {evt.titleHindi}
                        </p>
                        {evt.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {evt.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            eventId: evt.id,
                            title: evt.title,
                          })
                        }
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        data-ocid={`calendar.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent data-ocid="calendar.dialog">
          <DialogHeader>
            <DialogTitle>Add Event / इवेंट जोड़ें</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title (English) *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="mt-1"
                data-ocid="calendar.form.title.input"
              />
            </div>
            <div>
              <Label>Title (Hindi) / शीर्षक (हिंदी)</Label>
              <Input
                value={form.titleHindi}
                onChange={(e) =>
                  setForm((p) => ({ ...p, titleHindi: e.target.value }))
                }
                className="mt-1"
                data-ocid="calendar.form.title_hindi.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="calendar.form.date.input"
                />
              </div>
              <div>
                <Label>End Date (optional)</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endDate: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="calendar.form.end_date.input"
                />
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as CalendarEvent["type"] }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="calendar.form.type.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Holiday", "Exam", "Meeting", "Event", "Deadline"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="mt-1"
                placeholder="Optional description..."
                data-ocid="calendar.form.description.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialog(false)}
              data-ocid="calendar.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} data-ocid="calendar.confirm_button">
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(v) => setDeleteDialog((p) => ({ ...p, open: v }))}
      >
        <DialogContent data-ocid="calendar.delete_dialog">
          <DialogHeader>
            <DialogTitle>Delete Event / इवेंट हटाएं</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{deleteDialog.title}&quot;?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog((p) => ({ ...p, open: false }))}
              data-ocid="calendar.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeEvent(deleteDialog.eventId);
                toast.success("Event deleted");
                setDeleteDialog((p) => ({ ...p, open: false }));
              }}
              data-ocid="calendar.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
