import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AppNotification, NotificationReadStatus } from "../types/models";

const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Faculty Meeting Scheduled",
    titleHindi: "शिक्षक बैठक निर्धारित",
    body: "A faculty meeting has been scheduled for this Friday at 3:00 PM in the Conference Room. All faculty members are requested to attend.",
    bodyHindi:
      "इस शुक्रवार दोपहर 3 बजे सम्मेलन कक्ष में एक शिक्षक बैठक निर्धारित की गई है। सभी शिक्षकों से उपस्थित रहने का अनुरोध है।",
    senderId: "demo-admin",
    isGlobal: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "notif-2",
    title: "Bill Submission Deadline",
    titleHindi: "बिल जमा करने की अंतिम तिथि",
    body: "Please submit all pending class bills before the 5th of next month to ensure timely payment processing.",
    bodyHindi:
      "समय पर भुगतान प्रक्रिया सुनिश्चित करने के लिए कृपया अगले महीने की 5 तारीख से पहले सभी लंबित कक्षा बिल जमा करें।",
    senderId: "demo-admin",
    isGlobal: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export function useNotificationStore() {
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(
    "ftms_notifications",
    SAMPLE_NOTIFICATIONS,
  );
  const [readStatuses, setReadStatuses] = useLocalStorage<
    NotificationReadStatus[]
  >("ftms_notif_read", []);

  const getNotificationsForUser = (userId: string) =>
    notifications
      .filter((n) => n.isGlobal || n.recipientId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

  const isRead = (notificationId: string, userId: string) =>
    readStatuses.some(
      (r) =>
        r.notificationId === notificationId && r.userId === userId && r.isRead,
    );

  const getUnreadCount = (userId: string) =>
    getNotificationsForUser(userId).filter((n) => !isRead(n.id, userId)).length;

  const markAsRead = (notificationId: string, userId: string) => {
    setReadStatuses((prev) => {
      const existing = prev.find(
        (r) => r.notificationId === notificationId && r.userId === userId,
      );
      if (existing) {
        return prev.map((r) =>
          r.notificationId === notificationId && r.userId === userId
            ? { ...r, isRead: true, readAt: new Date().toISOString() }
            : r,
        );
      }
      return [
        ...prev,
        {
          notificationId,
          userId,
          isRead: true,
          readAt: new Date().toISOString(),
        },
      ];
    });
  };

  const markAllAsRead = (userId: string) => {
    const userNotifs = getNotificationsForUser(userId);
    setReadStatuses((prev) => {
      const updated = [...prev];
      for (const n of userNotifs) {
        const existing = updated.find(
          (r) => r.notificationId === n.id && r.userId === userId,
        );
        if (!existing) {
          updated.push({
            notificationId: n.id,
            userId,
            isRead: true,
            readAt: new Date().toISOString(),
          });
        } else if (!existing.isRead) {
          const idx = updated.indexOf(existing);
          updated[idx] = {
            ...existing,
            isRead: true,
            readAt: new Date().toISOString(),
          };
        }
      }
      return updated;
    });
  };

  const sendNotification = (
    notif: Omit<AppNotification, "id" | "createdAt">,
  ) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  };

  return {
    notifications,
    getNotificationsForUser,
    isRead,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
  };
}
