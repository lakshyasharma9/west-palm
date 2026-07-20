import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, CheckCircle2, Clock, Building2, ArrowUpRight } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MonthlyQueriesChart, ServicesChart, StatusChart } from "@/components/admin/Charts";
import { useStore } from "@/lib/store";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { queries, projects } = useStore();
  const now = new Date();
  const thisMonth = queries.filter((q) => {
    const d = new Date(q.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const pending = queries.filter((q) => q.status === "pending").length;
  const resolved = queries.filter((q) => q.status === "resolved").length;
  const recent = [...queries]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of inquiries and project activity at WPCS.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Queries this month" value={thisMonth} icon={ArrowUpRight} trend="↑ trending up" tone="info" />
        <StatsCard label="Pending Queries" value={pending} icon={Clock} tone="warning" />
        <StatsCard label="Resolved Queries" value={resolved} icon={CheckCircle2} tone="success" />
        <StatsCard label="Active Projects" value={projects.length} icon={Building2} tone="primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Monthly Queries" subtitle="Inquiries over the last 6 months">
          <MonthlyQueriesChart queries={queries} />
        </ChartCard>
        <ChartCard title="Services Breakdown" subtitle="Most-requested services">
          <ServicesChart queries={queries} />
        </ChartCard>
        <ChartCard title="Query Status" subtitle="Pending vs Resolved">
          <StatusChart queries={queries} />
        </ChartCard>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-border bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recent Queries</h2>
          </div>
          <Link
            to="/admin/queries"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Service</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.map((q) => (
                <tr key={q.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-foreground">{q.fullName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{q.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {q.services[0]}
                    {q.services.length > 1 ? ` +${q.services.length - 1}` : ""}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {format(new Date(q.date), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={q.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
