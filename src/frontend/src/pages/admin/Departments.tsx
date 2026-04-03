import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Edit3, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Department } from "../../store/useDepartmentStore";
import { useDepartmentStore } from "../../store/useDepartmentStore";

interface DeptFormState {
  name: string;
  nameHindi: string;
  designationsRaw: string;
}

const emptyForm: DeptFormState = {
  name: "",
  nameHindi: "",
  designationsRaw: "",
};

export function Departments() {
  const { departments, addDepartment, updateDepartment, deleteDepartment } =
    useDepartmentStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [form, setForm] = useState<DeptFormState>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditTarget(dept);
    setForm({
      name: dept.name,
      nameHindi: dept.nameHindi,
      designationsRaw: dept.designations.join(", "),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.nameHindi.trim()) {
      toast.error("नाम आवश्यक है / Name is required");
      return;
    }
    const designations = form.designationsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (editTarget) {
      updateDepartment(editTarget.id, {
        name: form.name.trim(),
        nameHindi: form.nameHindi.trim(),
        designations,
      });
      toast.success("विभाग अपडेट / Department updated");
    } else {
      addDepartment({
        name: form.name.trim(),
        nameHindi: form.nameHindi.trim(),
        designations,
      });
      toast.success("विभाग जोड़ा / Department added");
    }
    setDialogOpen(false);
    setForm(emptyForm);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    deleteDepartment(id);
    setDeleteConfirmId(null);
    toast.success("विभाग हटाया / Department deleted");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      data-ocid="departments.page"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold">विभाग / Departments</h2>
            <p className="text-xs text-muted-foreground">
              {departments.length} departments configured
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={openAdd}
          data-ocid="departments.open_modal_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department / विभाग जोड़ें
        </Button>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        data-ocid="departments.list"
      >
        {departments.map((dept, idx) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            data-ocid={`departments.item.${idx + 1}`}
          >
            <Card className="border-border shadow-card h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-bold leading-tight">
                    {dept.name}
                    <span className="block text-[11px] text-muted-foreground font-normal mt-0.5">
                      {dept.nameHindi}
                    </span>
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7"
                      onClick={() => openEdit(dept)}
                      data-ocid={`departments.edit_button.${idx + 1}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirmId(dept.id)}
                      data-ocid={`departments.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {dept.designations.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {dept.designations.map((des) => (
                      <Badge
                        key={des}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {des}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No designations configured
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {departments.length === 0 && (
          <div
            className="col-span-full text-center py-16 text-muted-foreground"
            data-ocid="departments.empty_state"
          >
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No departments configured yet</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="departments.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget
                ? "विभाग संपादित करें / Edit Department"
                : "नया विभाग / Add Department"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Department Name (English) *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Computer Science"
                className="mt-1"
                data-ocid="departments.name.input"
              />
            </div>
            <div>
              <Label className="text-xs">विभाग का नाम (हिंदी) *</Label>
              <Input
                value={form.nameHindi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nameHindi: e.target.value }))
                }
                placeholder="जैसे कंप्यूटर विज्ञान"
                className="mt-1"
                data-ocid="departments.name_hindi.input"
              />
            </div>
            <div>
              <Label className="text-xs">
                Designations (comma-separated) / पदनाम (अल्पविराम से)
              </Label>
              <Input
                value={form.designationsRaw}
                onChange={(e) =>
                  setForm((f) => ({ ...f, designationsRaw: e.target.value }))
                }
                placeholder="Professor, Associate Professor, Assistant Professor"
                className="mt-1"
                data-ocid="departments.designations.input"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Separate each designation with a comma
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="departments.cancel_button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} data-ocid="departments.save_button">
              {editTarget ? "Update / अपडेट" : "Add / जोड़ें"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent data-ocid="departments.delete_confirm.dialog">
          <DialogHeader>
            <DialogTitle>विभाग हटाएं / Delete Department?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the department and all its designation
            data. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              data-ocid="departments.delete_confirm.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              data-ocid="departments.delete_confirm.confirm_button"
            >
              Delete / हटाएं
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
