import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { useNoticeBoardStore } from "../../store/useNoticeBoardStore";
import type { Notice } from "../../store/useNoticeBoardStore";
import type { FacultyProfile } from "../../types/models";

interface NoticeBoardTeacherProps {
  profile: FacultyProfile;
}

const PRIORITY_STYLES: Record<Notice["priority"], string> = {
  Normal: "",
  Important: "border-l-4 border-l-amber-500",
  Urgent: "border-l-4 border-l-red-500",
};

const PRIORITY_BADGE: Record<Notice["priority"], string> = {
  Normal: "bg-muted text-muted-foreground",
  Important: "bg-amber-100 text-amber-700",
  Urgent: "bg-red-100 text-red-700",
};

export function NoticeBoardTeacher({ profile: _ }: NoticeBoardTeacherProps) {
  const { getActiveNotices } = useNoticeBoardStore();

  const notices = useMemo(
    () => getActiveNotices("teacher"),
    [getActiveNotices],
  );

  // Sort: Urgent first, then Important, then Normal
  const sorted = useMemo(() => {
    const order: Record<Notice["priority"], number> = {
      Urgent: 0,
      Important: 1,
      Normal: 2,
    };
    return [...notices].sort((a, b) => order[a.priority] - order[b.priority]);
  }, [notices]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="notice_board_teacher.page"
    >
      <div className="flex items-center gap-3 mb-2">
        <Newspaper className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">Notice Board / सूचना पट्ट</h2>
          <p className="text-xs text-muted-foreground">
            {sorted.length} active notice{sorted.length !== 1 ? "s" : ""} for
            you
          </p>
        </div>
      </div>

      <div className="space-y-3" data-ocid="notice_board_teacher.list">
        <AnimatePresence>
          {sorted.map((notice, i) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.05 }}
              data-ocid={`notice_board_teacher.item.${i + 1}`}
            >
              <Card
                className={`border-border shadow-xs overflow-hidden ${
                  PRIORITY_STYLES[notice.priority]
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${PRIORITY_BADGE[notice.priority]}`}
                        >
                          {notice.priority}
                        </Badge>
                        {notice.priority === "Urgent" && (
                          <Badge className="bg-red-600 text-white text-[10px]">
                            तत्काल / URGENT
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-sm mt-2">{notice.title}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {notice.titleHindi}
                      </p>
                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        {notice.content}
                      </p>
                      {notice.contentHindi && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {notice.contentHindi}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-[10px] text-muted-foreground">
                      Posted by {notice.postedBy} &bull;{" "}
                      {new Date(notice.postedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {sorted.length === 0 && (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="notice_board_teacher.empty_state"
          >
            <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No active notices at this time</p>
            <p className="text-xs mt-1">अभी कोई सक्रिय सूचना नहीं</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
