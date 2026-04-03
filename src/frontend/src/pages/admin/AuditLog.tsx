import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen as BookOpenIcon,
  CalendarOff as CalendarOffIcon,
  Printer as PrinterIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Trash2 as TrashIcon,
  UserCog as UserCogIcon,
  Users as UsersIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useAuditStore } from "../../store/useAuditStore";
import type { AuditLog as AuditLogEntry } from "../../types/models";

type Category = "All" | AuditLogEntry["category"];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  User: <UserCogIcon className="w-4 h-4" />,
  Billing: <ReceiptIcon className="w-4 h-4" />,
  Leave: <CalendarOffIcon className="w-4 h-4" />,
  Settings: <SettingsIcon className="w-4 h-4" />,
  Faculty: <UsersIcon className="w-4 h-4" />,
  Exam: <BookOpenIcon className="w-4 h-4" />,
  System: <ShieldIcon className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  User: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Billing:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Leave: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Settings: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  Faculty:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Exam: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  System:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
};

const ITEMS_PER_PAGE = 20;

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AuditLog() {
  const { logs, clearOldLogs } = useAuditStore();
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...logs];
    if (category !== "All")
      result = result.filter((l) => l.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.actorName.toLowerCase().includes(q) ||
          (l.details ?? "").toLowerCase().includes(q),
      );
    }
    if (dateFrom) result = result.filter((l) => l.timestamp >= dateFrom);
    if (dateTo)
      result = result.filter((l) => l.timestamp <= `${dateTo}T23:59:59`);
    return result;
  }, [logs, category, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      data-ocid="audit.page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            गतिविधि लॉग | System activity trail
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            data-ocid="audit.print_button"
          >
            <PrinterIcon className="w-4 h-4 mr-2" /> Export
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                data-ocid="audit.clear.open_modal_button"
              >
                <TrashIcon className="w-4 h-4 mr-2" /> Clear Old Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="audit.clear.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Clear Old Logs / पुराने लॉग हटाएं?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all audit logs older than 90 days. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="audit.clear.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearOldLogs(90)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-ocid="audit.clear.confirm_button"
                >
                  Clear Logs
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border shadow-card">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3">
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v as Category);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36" data-ocid="audit.category.select">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "All",
                  "User",
                  "Billing",
                  "Leave",
                  "Settings",
                  "Faculty",
                  "Exam",
                  "System",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-56"
              data-ocid="audit.search_input"
            />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-36"
              data-ocid="audit.date_from.input"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-36"
              data-ocid="audit.date_to.input"
            />
            <div className="ml-auto text-sm text-muted-foreground self-center">
              {filtered.length} entries
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-border shadow-card">
        <CardContent className="pt-4">
          {paginated.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-8"
              data-ocid="audit.empty_state"
            >
              No audit logs found
            </p>
          ) : (
            <div className="space-y-2" data-ocid="audit.list">
              {paginated.map((log, i) => (
                <div
                  key={log.id}
                  className="flex gap-4 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  data-ocid={`audit.item.${i + 1}`}
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${CATEGORY_COLORS[log.category] ?? ""}`}
                  >
                    {CATEGORY_ICONS[log.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.action}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[log.category] ?? ""}`}
                      >
                        {log.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by <span className="font-medium">{log.actorName}</span>
                      {log.details && ` — ${log.details}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium">
                      {timeAgo(log.timestamp)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                data-ocid="audit.pagination_prev"
              >
                Previous
              </Button>
              <span className="text-sm">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                data-ocid="audit.pagination_next"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
