import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  tone?: "primary" | "warning" | "success" | "info";
}

const toneClasses: Record<NonNullable<Props["tone"]>, string> = {
  primary: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  info: "bg-sidebar/10 text-sidebar",
};

export function StatsCard({ label, value, icon: Icon, trend, tone = "primary" }: Props) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-success">{trend}</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            toneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
