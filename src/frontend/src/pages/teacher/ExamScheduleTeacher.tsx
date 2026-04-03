import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen as BookOpenIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  GraduationCap as GraduationCapIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useExamStore } from "../../store/useExamStore";
import { useTimetableStore } from "../../store/useTimetableStore";
import type { FacultyProfile } from "../../types/models";

interface ExamScheduleTeacherProps {
  profile: FacultyProfile;
}

function typeColor(type: string) {
  switch (type) {
    case "Internal":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "External":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "Practical":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "Viva":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    default:
      return "";
  }
}

export function ExamScheduleTeacher({ profile }: ExamScheduleTeacherProps) {
  const { exams, getExamsByInvigilator, getResultsByExam } = useExamStore();
  const { subjects, rooms } = useTimetableStore();

  const invigilationDuties = useMemo(
    () =>
      getExamsByInvigilator(profile.id).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    [profile.id, getExamsByInvigilator],
  );

  const upcomingExams = useMemo(
    () =>
      exams
        .filter((e) => e.status === "Scheduled")
        .sort((a, b) => a.date.localeCompare(b.date)),
    [exams],
  );

  // Completed exams where teacher is invigilator
  const completedInvigilation = useMemo(
    () => invigilationDuties.filter((e) => e.status === "Completed"),
    [invigilationDuties],
  );

  // Group upcoming by month
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof upcomingExams> = {};
    for (const exam of upcomingExams) {
      const month = exam.date.slice(0, 7); // YYYY-MM
      if (!groups[month]) groups[month] = [];
      groups[month].push(exam);
    }
    return groups;
  }, [upcomingExams]);

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="teacher_exam.page"
    >
      <div>
        <h1 className="text-2xl font-bold">Exam Schedule</h1>
        <p className="text-sm text-muted-foreground">
          परीक्षा अनुसूची | Your invigilation duties &amp; upcoming exams
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: "My Duties",
            labelH: "मेरी ड्यूटी",
            value: invigilationDuties.length,
            icon: <GraduationCapIcon className="w-5 h-5" />,
            color: "text-primary",
          },
          {
            label: "Upcoming",
            labelH: "आगामी",
            value: upcomingExams.length,
            icon: <CalendarIcon className="w-5 h-5" />,
            color: "text-blue-500",
          },
          {
            label: "Completed",
            labelH: "पूर्ण",
            value: completedInvigilation.length,
            icon: <ClockIcon className="w-5 h-5" />,
            color: "text-green-500",
          },
        ].map((s) => (
          <Card key={s.label} className="border-border shadow-card">
            <CardContent className="pt-6 pb-4">
              <div className={`mb-2 ${s.color}`}>{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground">
                {s.labelH}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invigilation Duties */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCapIcon className="w-4 h-4 text-primary" />
            My Invigilation Duties / मेरी परीक्षक ड्यूटी
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invigilationDuties.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-8"
              data-ocid="teacher_exam.duties.empty_state"
            >
              No invigilation duties assigned yet / अभी कोई ड्यूटी नहीं
            </p>
          ) : (
            <Table data-ocid="teacher_exam.duties.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invigilationDuties.map((exam, i) => {
                  const subject = subjects.find((s) => s.id === exam.subjectId);
                  const room = rooms.find((r) => r.id === exam.roomId);
                  return (
                    <TableRow
                      key={exam.id}
                      data-ocid={`teacher_exam.duty.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {exam.title}
                      </TableCell>
                      <TableCell>{exam.date}</TableCell>
                      <TableCell>
                        {exam.startTime}–{exam.endTime}
                      </TableCell>
                      <TableCell>{subject?.name ?? exam.subjectId}</TableCell>
                      <TableCell>{room?.name ?? exam.roomId}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(exam.type)}`}
                        >
                          {exam.type}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Exams Calendar-style */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpenIcon className="w-4 h-4 text-blue-500" />
            Upcoming Exams / आगामी परीक्षाएं
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedByMonth).length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="teacher_exam.upcoming.empty_state"
            >
              No upcoming exams scheduled
            </p>
          ) : (
            <div className="space-y-6" data-ocid="teacher_exam.upcoming.list">
              {Object.entries(groupedByMonth).map(([month, monthExams]) => (
                <div key={month}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {monthLabel(month)}
                  </h3>
                  <div className="space-y-2">
                    {monthExams.map((exam, i) => {
                      const subject = subjects.find(
                        (s) => s.id === exam.subjectId,
                      );
                      const room = rooms.find((r) => r.id === exam.roomId);
                      const isMyDuty = exam.invigilatorIds.includes(profile.id);
                      return (
                        <div
                          key={exam.id}
                          className={`flex items-start gap-4 p-3 rounded-lg border ${
                            isMyDuty
                              ? "border-primary/30 bg-primary/5"
                              : "border-border"
                          }`}
                          data-ocid={`teacher_exam.upcoming.item.${i + 1}`}
                        >
                          <div className="text-center w-12 flex-shrink-0">
                            <div className="text-lg font-bold leading-none">
                              {exam.date.slice(8, 10)}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              {new Date(exam.date).toLocaleString("en-US", {
                                month: "short",
                              })}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{exam.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {subject?.name} &bull; {exam.startTime}–
                              {exam.endTime} &bull; {room?.name}
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(exam.type)}`}
                            >
                              {exam.type}
                            </span>
                            {isMyDuty && (
                              <Badge variant="secondary" className="text-xs">
                                My Duty
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Entry for completed invigilation */}
      {completedInvigilation.length > 0 && (
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-base">
              परिणाम / Results for Your Invigilated Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedInvigilation.map((exam) => {
                const examResults = getResultsByExam(exam.id);
                const subject = subjects.find((s) => s.id === exam.subjectId);
                return (
                  <div
                    key={exam.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div className="p-3 bg-muted/50 font-medium text-sm">
                      {exam.title} &mdash; {subject?.name} &mdash; {exam.date}
                    </div>
                    {examResults.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Marks / {exam.maxMarks}</TableHead>
                            <TableHead>Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {examResults.map((r) => (
                            <TableRow key={r.id}>
                              <TableCell>{r.rollNumber}</TableCell>
                              <TableCell>{r.studentName}</TableCell>
                              <TableCell>{r.marksObtained}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{r.grade}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No results entered yet
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
