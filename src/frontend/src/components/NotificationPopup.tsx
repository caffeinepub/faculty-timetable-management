import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { AppNotification } from "../types/models";

interface NotificationPopupProps {
  notification: AppNotification | null;
  userId: string;
  onMarkRead: (id: string) => void;
  onDismiss: () => void;
}

export function NotificationPopup({
  notification,
  userId: _userId,
  onMarkRead,
  onDismiss,
}: NotificationPopupProps) {
  const [showHindi, setShowHindi] = useState(true);

  if (!notification) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: 80, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
        data-ocid="notification.toast"
      >
        <div className="bg-card border border-border rounded-xl shadow-[0_8px_32px_rgba(16,24,40,0.16)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-600 text-foreground">
                  सूचना / Notification
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              data-ocid="notification.close_button"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-3">
            {/* Language toggle */}
            <div className="flex gap-1 mb-2">
              <button
                type="button"
                onClick={() => setShowHindi(false)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                  !showHindi
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setShowHindi(true)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                  showHindi
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                हिंदी
              </button>
            </div>

            <h4 className="text-sm font-semibold text-foreground mb-1">
              {showHindi ? notification.titleHindi : notification.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {showHindi ? notification.bodyHindi : notification.body}
            </p>
          </div>

          {/* Actions */}
          <div className="px-4 pb-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={() => {
                onMarkRead(notification.id);
                onDismiss();
              }}
              data-ocid="notification.confirm_button"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              पढ़ा हुआ / Read
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
