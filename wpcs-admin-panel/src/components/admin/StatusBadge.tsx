import { cn } from "@/lib/utils";
import type { QueryStatus } from "@/lib/mockData";

export function StatusBadge({ status }: { status: QueryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        status === "pending"
          ? "bg-warning/15 text-warning ring-warning/30"
          : "bg-success/15 text-success ring-success/30",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "pending" ? "bg-warning" : "bg-success",
        )}
      />
      {status === "pending" ? "Pending" : "Resolved"}
    </span>
  );
}
