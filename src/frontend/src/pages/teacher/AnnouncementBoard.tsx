import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useNotificationStore } from "../../store/useNotificationStore";
import type { FacultyProfile } from "../../types/models";

interface AnnouncementBoardProps {
  profile: FacultyProfile;
}

export function AnnouncementBoard({ profile }: AnnouncementBoardProps) {
  const { getNotificationsForUser, isRead, markAsRead, markAllAsRead } =
    useNotificationStore();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");

  const notifications = useMemo(
    () => getNotificationsForUser(profile.id),
    [getNotificationsForUser, profile.id],
  );

  const filtered = useMemo(() => {
    let list = notifications;
    if (filter === "unread")
      list = list.filter((n) => !isRead(n.id, profile.id));
    else if (filter === "read")
      list = list.filter((n) => isRead(n.id, profile.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.titleHindi.includes(q) ||
          n.body.toLowerCase().includes(q),
      );
    }
    return list;
  }, [notifications, filter, isRead, profile.id, search]);

  const unreadCount = notifications.filter(
    (n) => !isRead(n.id, profile.id),
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="announcements.page"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold">Announcements</h2>
          <p className="text-xs text-muted-foreground">घोषणाएं</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead(profile.id)}
            data-ocid="announcements.mark_all_read.button"
          >
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="pl-9"
            data-ocid="announcements.search_input"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "unread", "read"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
              data-ocid={`announcements.${f}.tab`}
            >
              {f === "all" ? "All" : f === "unread" ? "अपठित" : "पठित"}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="announcements.empty_state"
        >
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>कोई सूचना नहीं / No announcements found</p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="announcements.list">
          {filtered.map((n, i) => {
            const read = isRead(n.id, profile.id);
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`announcements.item.${i + 1}`}
              >
                <Card
                  className={`border cursor-pointer hover:shadow-md transition-shadow ${read ? "border-border" : "border-primary/30 bg-primary/[0.02]"}`}
                  onClick={() => !read && markAsRead(n.id, profile.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${read ? "bg-transparent" : "bg-primary"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{n.title}</p>
                          {!read && (
                            <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20 px-1.5">
                              New
                            </Badge>
                          )}
                          {n.isGlobal && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5"
                            >
                              Global
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {n.titleHindi}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {n.bodyHindi}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(n.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
