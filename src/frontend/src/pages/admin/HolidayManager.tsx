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
import {
  Building2 as BuildingIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  MapPin as MapPinIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  Umbrella as UmbrellaIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuditStore } from "../../store/useAuditStore";
import { useHolidayStore } from "../../store/useHolidayStore";
import type { Holiday } from "../../types/models";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TYPE_COLORS: Record<string, string> = {
  National:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  State: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Institute:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const EMPTY_FORM = {
  name: "",
  nameHindi: "",
  date: "",
  type: "National" as Holiday["type"],
  isActive: true,
};

export function HolidayManager() {
  const { holidays, addHoliday, updateHoliday, deleteHoliday, toggleActive } =
    useHolidayStore();
  const { addLog } = useAuditStore();

  const [yearFilter, setYearFilter] = useState("2026");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const years = useMemo(() => {
    const ys = new Set(holidays.map((h) => h.date.slice(0, 4)));
    return Array.from(ys).sort();
  }, [holidays]);

  const filtered = useMemo(() => {
    if (yearFilter === "all") return holidays;
    return holidays.filter((h) => h.date.startsWith(yearFilter));
  }, [holidays, yearFilter]);

  const stats = useMemo(
    () => ({
      total: filtered.length,
      national: filtered.filter((h) => h.type === "National").length,
      state: filtered.filter((h) => h.type === "State").length,
      institute: filtered.filter((h) => h.type === "Institute").length,
    }),
    [filtered],
  );

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (holiday: Holiday) => {
    setForm({
      name: holiday.name,
      nameHindi: holiday.nameHindi,
      date: holiday.date,
      type: holiday.type,
      isActive: holiday.isActive,
    });
    setEditId(holiday.id);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.date) {
      toast.error("Please fill name and date / नाम और तारीख अनिवार्य हैं");
      return;
    }
    if (editId) {
      updateHoliday(editId, form);
      addLog({
        actorId: "demo-admin",
        actorName: "Dr. Rajesh Kumar",
        action: `Updated holiday: ${form.name}`,
        category: "System",
        details: `Date: ${form.date}`,
      });
      toast.success("Holiday updated / अवकाश अपडेट किया गया");
    } else {
      addHoliday(form);
      addLog({
        actorId: "demo-admin",
        actorName: "Dr. Rajesh Kumar",
        action: `Added holiday: ${form.name}`,
        category: "System",
        details: `Date: ${form.date} | Type: ${form.type}`,
      });
      toast.success("Holiday added / अवकाश जोड़ा गया");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const holiday = holidays.find((h) => h.id === id);
    deleteHoliday(id);
    addLog({
      actorId: "demo-admin",
      actorName: "Dr. Rajesh Kumar",
      action: `Deleted holiday: ${holiday?.name ?? id}`,
      category: "System",
    });
    toast.success("Holiday deleted / अवकाश हटाया गया");
    setDeleteConfirmId(null);
  };

  const handleImport = () => {
    toast.info("2026 Rajasthan holidays already imported / पहले से आयात हैं");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="holiday.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Holiday Manager</h1>
          <p className="text-sm text-muted-foreground">
            अवकाश प्रबंधन | Manage institutional holiday calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            data-ocid="holiday.import_button"
          >
            <DownloadIcon className="w-4 h-4 mr-2" /> Import 2026 Defaults
          </Button>
          <Button onClick={openAdd} data-ocid="holiday.add_button">
            <PlusIcon className="w-4 h-4 mr-2" /> Add Holiday
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Holidays",
            labelH: "कुल अवकाश",
            value: stats.total,
            icon: <UmbrellaIcon className="w-5 h-5" />,
            color: "text-primary",
          },
          {
            label: "National",
            labelH: "राष्ट्रीय",
            value: stats.national,
            icon: <FlagIcon className="w-5 h-5" />,
            color: "text-orange-500",
          },
          {
            label: "State",
            labelH: "राज्य",
            value: stats.state,
            icon: <MapPinIcon className="w-5 h-5" />,
            color: "text-blue-500",
          },
          {
            label: "Institute",
            labelH: "संस्थान",
            value: stats.institute,
            icon: <BuildingIcon className="w-5 h-5" />,
            color: "text-purple-500",
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

      {/* Year Filter + Table */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              अवकाश सूची / Holiday List
            </CardTitle>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-24" data-ocid="holiday.year.select">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table data-ocid="holiday.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name (EN)</TableHead>
                <TableHead>Name (हि)ंदी</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((h, i) => (
                <TableRow key={h.id} data-ocid={`holiday.item.${i + 1}`}>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell>{h.nameHindi}</TableCell>
                  <TableCell>{h.date}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {DAYS[new Date(h.date).getDay()]}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[h.type] ?? ""}`}
                    >
                      {h.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={h.isActive}
                      onCheckedChange={() => toggleActive(h.id)}
                      data-ocid={`holiday.active.switch.${i + 1}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(h)}
                        data-ocid={`holiday.edit_button.${i + 1}`}
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(h.id)}
                        data-ocid={`holiday.delete_button.${i + 1}`}
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p
              className="text-sm text-muted-foreground text-center py-8"
              data-ocid="holiday.empty_state"
            >
              No holidays found for the selected year
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="holiday.dialog">
          <DialogHeader>
            <DialogTitle>
              {editId
                ? "Edit Holiday / अवकाश संपादित"
                : "Add Holiday / अवकाश जोड़ें"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Name (English) / नाम</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Republic Day"
                data-ocid="holiday.name.input"
              />
            </div>
            <div>
              <Label>Name (हि)ंदी)</Label>
              <Input
                value={form.nameHindi}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nameHindi: e.target.value }))
                }
                placeholder="अवकाश का नाम"
                data-ocid="holiday.name_hindi.input"
              />
            </div>
            <div>
              <Label>Date / तारीख</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="holiday.date.input"
              />
            </div>
            <div>
              <Label>Type / प्रकार</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, type: v as Holiday["type"] }))
                }
              >
                <SelectTrigger data-ocid="holiday.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="National">राष्ट्रीय / National</SelectItem>
                  <SelectItem value="State">राज्य / State</SelectItem>
                  <SelectItem value="Institute">संस्थान / Institute</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-ocid="holiday.dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-ocid="holiday.dialog.submit_button"
            >
              {editId ? "Update" : "Add Holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent data-ocid="holiday.delete.dialog">
          <DialogHeader>
            <DialogTitle>Delete Holiday / अवकाश हटाएं?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete this holiday entry.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              data-ocid="holiday.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              data-ocid="holiday.delete.confirm_button"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
