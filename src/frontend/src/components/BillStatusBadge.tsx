import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BillStatus } from "../types/models";

interface BillStatusBadgeProps {
  status: BillStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  BillStatus,
  { label: string; labelHindi: string; classes: string }
> = {
  Draft: {
    label: "Draft",
    labelHindi: "प्रारूप",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  Submitted: {
    label: "Submitted",
    labelHindi: "जमा",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Checked: {
    label: "Checked",
    labelHindi: "जांचा",
    classes: "bg-purple-100 text-purple-700 border-purple-200",
  },
  Approved: {
    label: "Approved",
    labelHindi: "स्वीकृत",
    classes: "bg-green-100 text-green-700 border-green-200",
  },
  Rejected: {
    label: "Rejected",
    labelHindi: "अस्वीकार",
    classes: "bg-red-100 text-red-700 border-red-200",
  },
};

export function BillStatusBadge({ status, className }: BillStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold border", config.classes, className)}
    >
      {config.label}
    </Badge>
  );
}
