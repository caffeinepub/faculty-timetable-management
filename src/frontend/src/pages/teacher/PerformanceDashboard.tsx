import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Star, TrendingUp, User } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { usePerformanceStore } from "../../store/usePerformanceStore";
import type { FacultyProfile } from "../../types/models";

interface PerformanceDashboardProps {
  profile: FacultyProfile;
}

function MotivationCard({ score }: { score: number }) {
  if (score >= 8)
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
        <Award className="w-8 h-8 text-green-600 flex-shrink-0" />
        <div>
          <div className="font-bold text-green-700">उत्कृष्ट! / Excellent! 🌟</div>
          <div className="text-sm text-green-600">
            You are performing exceptionally well. Keep inspiring your students!
          </div>
        </div>
      </div>
    );
  if (score >= 5)
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <TrendingUp className="w-8 h-8 text-amber-600 flex-shrink-0" />
        <div>
          <div className="font-bold text-amber-700">अच्छा! / Good 👍</div>
          <div className="text-sm text-amber-600">
            Solid performance. Focus on research and student feedback to excel
            further.
          </div>
        </div>
      </div>
    );
  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
      <Star className="w-8 h-8 text-red-500 flex-shrink-0" />
      <div>
        <div className="font-bold text-red-700">
          सुधार की जरूरत / Needs Improvement
        </div>
        <div className="text-sm text-red-600">
          Please discuss with your HOD. Additional training resources are
          available.
        </div>
      </div>
    </div>
  );
}

const CHART_CONFIG = {
  score: { label: "Score", color: "hsl(var(--primary))" },
};

export function PerformanceDashboard({ profile }: PerformanceDashboardProps) {
  const { getReviewsByTeacher, getAverageScore, reviews, cycles } =
    usePerformanceStore();

  const myReviews = useMemo(
    () => getReviewsByTeacher(profile.id),
    [profile.id, getReviewsByTeacher],
  );

  const avgScore = useMemo(
    () => getAverageScore(profile.id),
    [profile.id, getAverageScore],
  );

  // Rank among all teachers
  const rank = useMemo(() => {
    const teacherScores: Record<string, number[]> = {};
    for (const r of reviews) {
      if (!teacherScores[r.teacherId]) teacherScores[r.teacherId] = [];
      teacherScores[r.teacherId].push(r.overallScore);
    }
    const avgs = Object.entries(teacherScores).map(([id, scores]) => ({
      id,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));
    avgs.sort((a, b) => b.avg - a.avg);
    const myPos = avgs.findIndex((a) => a.id === profile.id);
    return myPos >= 0 ? myPos + 1 : null;
  }, [reviews, profile.id]);

  // Chart data: average score per criterion across all my reviews
  const chartData = useMemo(() => {
    if (myReviews.length === 0) return [];
    const fields: (keyof (typeof myReviews)[0]["scores"])[] = [
      "teaching",
      "punctuality",
      "research",
      "studentFeedback",
      "administrativeDuties",
    ];
    const labels: Record<string, string> = {
      teaching: "Teaching",
      punctuality: "Punctuality",
      research: "Research",
      studentFeedback: "Feedback",
      administrativeDuties: "Admin",
    };
    return fields.map((f) => ({
      criterion: labels[f],
      score:
        Math.round(
          (myReviews.reduce((s, r) => s + r.scores[f], 0) / myReviews.length) *
            10,
        ) / 10,
    }));
  }, [myReviews]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="performance_dashboard.page"
    >
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sm">{profile.name}</div>
                <div className="text-xs text-muted-foreground">
                  {profile.department ?? "Faculty"}
                </div>
              </div>
            </div>
            <div className="text-4xl font-bold text-primary mb-1">
              {avgScore > 0 ? avgScore : "—"}
              <span className="text-lg text-muted-foreground">/10</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Overall Average Score
            </div>
            {rank && (
              <div className="mt-2 text-xs text-muted-foreground">
                Rank #{rank} among reviewed faculty
              </div>
            )}
            <div className="mt-3">
              {avgScore > 0 ? (
                <MotivationCard score={avgScore} />
              ) : (
                <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  No reviews yet. Your performance will be shown here once
                  reviewed.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Score Breakdown by Criterion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={CHART_CONFIG}
                className="h-[180px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="criterion"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="score"
                      fill="var(--color-score)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div
                className="h-[180px] flex items-center justify-center text-muted-foreground text-sm"
                data-ocid="performance_dashboard.chart.empty_state"
              >
                No review data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Reviews Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            My Reviews / मेरी समीक्षाएं
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Review Cycle</TableHead>
                <TableHead className="text-center">Teaching</TableHead>
                <TableHead className="text-center">Punctuality</TableHead>
                <TableHead className="text-center">Research</TableHead>
                <TableHead className="text-center">Feedback</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Overall</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myReviews.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                    data-ocid="performance_dashboard.reviews.empty_state"
                  >
                    No reviews yet. Check back after your performance is
                    reviewed.
                  </TableCell>
                </TableRow>
              )}
              {myReviews.map((r, idx) => (
                <TableRow
                  key={r.id}
                  data-ocid={`performance_dashboard.review.item.${idx + 1}`}
                >
                  <TableCell className="text-xs">
                    {cycles.find((c) => c.id === r.cycleId)?.title ?? r.cycleId}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.scores.teaching}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.scores.punctuality}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.scores.research}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.scores.studentFeedback}
                  </TableCell>
                  <TableCell className="text-center">
                    {r.scores.administrativeDuties}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={
                        r.overallScore >= 8
                          ? "bg-green-100 text-green-700"
                          : r.overallScore >= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }
                    >
                      {r.overallScore}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">
                    {r.remarks || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
