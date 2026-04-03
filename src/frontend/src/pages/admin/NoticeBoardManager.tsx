import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Newspaper, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Notice } from "../../store/useNoticeBoardStore";
import { useNoticeBoardStore } from "../../store/useNoticeBoardStore";

interface NoticeFormState {
  title: string;
  titleHindi: string;
  content: string;
  contentHindi: string;
  priority: "Normal" | "Important" | "Urgent";
  targetRole: "all" | "teacher" | "checker";
  isActive: boolean;
}

const emptyForm: NoticeFormState = {
  title: "",
  titleHindi: "",
  content: "",
  contentHindi: "",
  priority: "Normal",
  targetRole: "all",
  isActive: true,
};

const PRIORITY_COLORS: Record<Notice["priority"], string> = {
  Normal: "bg-muted text-muted-foreground",
  Important: "bg-amber-100 text-amber-700",
  Urgent: "bg-red-100 text-red-700",
};

export function NoticeBoardManager() {
  const { notices, addNotice, updateNotice, deleteNotice, toggleActive } =
    useNoticeBoardStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Notice | null>(null);
  const [form, setForm] = useState<NoticeFormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setEditTarget(notice);
    setForm({
      title: notice.title,
      titleHindi: notice.titleHindi,
      content: notice.content,
      contentHindi: notice.contentHindi,
      priority: notice.priority,
      targetRole: notice.targetRole ?? "all",
      isActive: notice.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required / शीर्षक और सामग्री आवश्यक है");
      return;
    }
    if (editTarget) {
      updateNotice(editTarget.id, form);
      toast.success("सूचना अपडेट / Notice updated");
    } else {
      addNotice({ ...form, postedBy: "Admin" });
      toast.success("सूचना पोस्ट / Notice posted");
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    deleteNotice(id);
    setDeleteId(null);
    toast.success("सूचना हटाई / Notice deleted");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="notice_board.page"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Newspaper className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold">
              सूचना पट्ट प्रबंधन / Notice Board Manager
            </h2>
            <p className="text-xs text-muted-foreground">
              {notices.filter((n) => n.isActive).length} active notices
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={openAdd}
          data-ocid="notice_board.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Notice / सूचना पोस्ट करें
        </Button>
      </div>

      <Card className="border-border shadow-card">
        <CardContent className="p-0">
          <Table data-ocid="notice_board.table">
            <TableHeader>
              <TableRow>
                <TableHead>Title / शीर्षक</TableHead>
                <TableHead>Priority / प्राथमिकता</TableHead>
                <TableHead>Target / लक्ष्य</TableHead>
                <TableHead>Posted / दिनांक</TableHead>
                <TableHead>Active / सक्रिय</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map((notice, i) => (
                <TableRow
                  key={notice.id}
                  data-ocid={`notice_board.item.${i + 1}`}
                >
                  <TableCell>
                    <div className="font-medium text-sm">{notice.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {notice.titleHindi}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] ${PRIORITY_COLORS[notice.priority]}`}
                      variant="outline"
                    >
                      {notice.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs capitalize">
                    {notice.targetRole ?? "all"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(notice.postedAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={notice.isActive}
                      onCheckedChange={() => toggleActive(notice.id)}
                      data-ocid={`notice_board.switch.${i + 1}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={() => openEdit(notice)}
                        data-ocid={`notice_board.edit_button.${i + 1}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(notice.id)}
                        data-ocid={`notice_board.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {notices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="notice_board.empty_state"
                  >
                    <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No notices posted yet</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Notice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="notice_board.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget
                ? "सूचना संपादित करें / Edit Notice"
                : "नई सूचना / Post New Notice"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <Label className="text-xs">Title (English) / शीर्षक *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Examination schedule update"
                className="mt-1"
                data-ocid="notice_board.title.input"
              />
            </div>
            <div>
              <Label className="text-xs">शीर्षक (हिंदी) *</Label>
              <Input
                value={form.titleHindi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titleHindi: e.target.value }))
                }
                placeholder="जैसे परीक्षा समय-सारणी अपडेट"
                className="mt-1"
                data-ocid="notice_board.title_hindi.input"
              />
            </div>
            <div>
              <Label className="text-xs">Content (English) / सामग्री *</Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Detailed notice content..."
                rows={3}
                className="mt-1 resize-none text-sm"
                data-ocid="notice_board.content.textarea"
              />
            </div>
            <div>
              <Label className="text-xs">सामग्री (हिंदी)</Label>
              <Textarea
                value={form.contentHindi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contentHindi: e.target.value }))
                }
                placeholder="विस्तृत सूचना सामग्री..."
                rows={3}
                className="mt-1 resize-none text-sm"
                data-ocid="notice_board.content_hindi.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Priority / प्राथमिकता</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      priority: v as NoticeFormState["priority"],
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="notice_board.priority.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Important">Important</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Target Role / लक्ष्य भूमिका</Label>
                <Select
                  value={form.targetRole}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      targetRole: v as NoticeFormState["targetRole"],
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="notice_board.target_role.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All / सभी</SelectItem>
                    <SelectItem value="teacher">Teacher / शिक्षक</SelectItem>
                    <SelectItem value="checker">Checker / जांचकर्ता</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="notice_board.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} data-ocid="notice_board.submit_button">
              {editTarget ? "Update / अपडेट" : "Post Notice / पोस्ट करें"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent data-ocid="notice_board.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              क्या आप सुनिश्चित हैं? / Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the notice. This action cannot be
              undone. / यह सूचना स्थायी रूप से हट जाएगी।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="notice_board.delete.cancel_button">
              Cancel / रद्द करें
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              data-ocid="notice_board.delete.confirm_button"
            >
              Delete / हटाएं
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
