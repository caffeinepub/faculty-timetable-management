import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, User, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useFacultyStore } from "../../store/useFacultyStore";
import { useNotificationStore } from "../../store/useNotificationStore";

export function NotificationComposer() {
  const { sendNotification, notifications } = useNotificationStore();
  const { getApprovedTeachers } = useFacultyStore();
  const teachers = getApprovedTeachers();

  const [title, setTitle] = useState("");
  const [titleHindi, setTitleHindi] = useState("");
  const [body, setBody] = useState("");
  const [bodyHindi, setBodyHindi] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [recipientId, setRecipientId] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title || !body) {
      toast.error("Title and body are required");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 500));
    sendNotification({
      title,
      titleHindi: titleHindi || title,
      body,
      bodyHindi: bodyHindi || body,
      senderId: "demo-admin",
      isGlobal,
      recipientId: isGlobal ? undefined : recipientId || undefined,
    });
    setTitle("");
    setTitleHindi("");
    setBody("");
    setBodyHindi("");
    setRecipientId("");
    setSending(false);
    toast.success("सूचना सफलतापूर्वक भेजी गई / Notification sent successfully");
  };

  const recentNotifs = notifications.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="notification_composer.page"
    >
      <div className="flex items-center gap-3 mb-2">
        <Bell className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold">सूचना भेजें / Send Notification</h2>
          <p className="text-xs text-muted-foreground">
            द्विभाषी सूचना प्रणाली / Bilingual notification system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Composer */}
        <Card className="lg:col-span-2 border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              नई सूचना / Compose Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient */}
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                {isGlobal ? (
                  <Users className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm font-medium">
                  {isGlobal
                    ? "सभी शिक्षक / All Teachers"
                    : "व्यक्तिगत / Individual"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">All</span>
                <Switch
                  checked={!isGlobal}
                  onCheckedChange={(v) => setIsGlobal(!v)}
                  data-ocid="notification.global.switch"
                />
                <span className="text-xs text-muted-foreground">
                  Individual
                </span>
              </div>
            </div>

            {!isGlobal && (
              <div>
                <Label className="text-xs">व्यक्ति / Recipient</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="notification.recipient.select"
                  >
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* English */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                English
              </div>
              <div>
                <Label className="text-xs">Title / शीर्षक</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="mt-1"
                  data-ocid="notification.title.input"
                />
              </div>
              <div>
                <Label className="text-xs">Body / संदेश</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Notification body..."
                  className="mt-1 h-24 text-sm"
                  data-ocid="notification.body.textarea"
                />
              </div>
            </div>

            {/* Hindi */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                हिंदी (Hindi)
              </div>
              <div>
                <Label className="text-xs">शीर्षक / Title</Label>
                <Input
                  value={titleHindi}
                  onChange={(e) => setTitleHindi(e.target.value)}
                  placeholder="\u0936ीर्षक..."
                  className="mt-1"
                  data-ocid="notification.title_hindi.input"
                />
              </div>
              <div>
                <Label className="text-xs">संदेश / Body</Label>
                <Textarea
                  value={bodyHindi}
                  onChange={(e) => setBodyHindi(e.target.value)}
                  placeholder="\u0938ंदेश..."
                  className="mt-1 h-24 text-sm"
                  data-ocid="notification.body_hindi.textarea"
                />
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full"
              data-ocid="notification.submit_button"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? "भेज रहे हैं..." : "सभी को भेजें / Send to All"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent notifications */}
        <Card className="border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              हालिया सूचनाएं / Recent
            </CardTitle>
          </CardHeader>
          <CardContent
            className="pt-0 space-y-3"
            data-ocid="notification_history.list"
          >
            {recentNotifs.map((n, i) => (
              <div
                key={n.id}
                className="border-b border-border last:border-0 pb-2 last:pb-0"
                data-ocid={`notification_history.item.${i + 1}`}
              >
                <p className="text-xs font-semibold text-foreground truncate">
                  {n.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {n.titleHindi}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {n.isGlobal ? "सभी शिक्षक / All" : "Individual"} &bull;{" "}
                  {new Date(n.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
            {recentNotifs.length === 0 && (
              <p
                className="text-xs text-muted-foreground text-center py-4"
                data-ocid="notification_history.empty_state"
              >
                No notifications sent yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
