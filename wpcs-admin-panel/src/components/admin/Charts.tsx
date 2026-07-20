import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Query } from "@/lib/mockData";
import { SERVICES } from "@/lib/mockData";

const PALETTE = [
  "oklch(0.74 0.13 85)", // gold
  "oklch(0.30 0.05 155)", // dark green
  "oklch(0.62 0.15 150)", // green
  "oklch(0.78 0.15 75)", // amber
  "oklch(0.55 0.18 30)", // rust
  "oklch(0.50 0.10 200)", // teal
  "oklch(0.65 0.12 280)", // violet
];

function tooltipStyle() {
  return {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--foreground)",
    boxShadow: "var(--shadow-card)",
  } as const;
}

export function MonthlyQueriesChart({ queries }: { queries: Query[] }) {
  const months: { label: string; key: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    months.push({
      key,
      label: d.toLocaleString("en", { month: "short" }),
      count: 0,
    });
  }
  for (const q of queries) {
    const d = new Date(q.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.count += 1;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={months} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={tooltipStyle()}
          cursor={{ fill: "var(--accent)", opacity: 0.4 }}
        />
        <Bar dataKey="count" name="Queries" fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ServicesChart({ queries }: { queries: Query[] }) {
  const data = SERVICES.map((name) => ({
    name,
    value: queries.filter((q) => q.services.includes(name)).length,
  })).filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle()} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={45}
          outerRadius={80}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatusChart({ queries }: { queries: Query[] }) {
  const pending = queries.filter((q) => q.status === "pending").length;
  const resolved = queries.filter((q) => q.status === "resolved").length;
  const data = [
    { name: "Pending", value: pending, color: "var(--warning)" },
    { name: "Resolved", value: resolved, color: "var(--success)" },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle()} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
        />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
