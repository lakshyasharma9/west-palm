import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, Eye, CheckCircle2, Trash2, Inbox } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { StatusBadge } from "@/components/admin/StatusBadge";
import { QueryDetailModal } from "@/components/admin/QueryDetailModal";
import { useStore } from "@/lib/store";
import * as api from "@/lib/api";
import type { Query } from "@/lib/mockData";

export const Route = createFileRoute("/admin/queries")({
  component: QueriesPage,
});

function QueriesPage() {
  const { queries, refreshQueries, loading } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [selected, setSelected] = useState<Query | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Refresh queries on mount
  useEffect(() => {
    // Data automatically fetched by React Query
    // No need to manually refresh on mount
  }, []);

  const filtered = useMemo(() => {
    return queries
      .filter((q) => (filter === "all" ? true : q.status === filter))
      .filter((q) => {
        if (!search.trim()) return true;
        const s = search.toLowerCase();
        return (
          q.fullName.toLowerCase().includes(s) ||
          q.email.toLowerCase().includes(s) ||
          q.company.toLowerCase().includes(s)
        );
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [queries, search, filter]);

  const markResolved = async (id: string) => {
    const result = await api.updateQueryStatus(id, "resolved");
    if (result.success) {
      toast.success("Query marked as resolved");
      refreshQueries(); // Invalidate cache
    } else {
      toast.error("Failed to update query");
    }
  };

  const deleteQuery = async (id: string) => {
    const result = await api.deleteQuery(id);
    if (result.success) {
      toast.success("Query deleted");
      refreshQueries(); // Invalidate cache
      setConfirmDelete(null);
      setSelected(null);
    } else {
      toast.error("Failed to delete query");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Queries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All contact form submissions from clients.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          {queries.length}
        </div>
      </div>

      <div
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or company…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-border bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Full Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Services</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Inbox className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No queries found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((q, i) => (
                  <tr key={q.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{q.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{q.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{q.company}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {q.services.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary"
                          >
                            {s}
                          </span>
                        ))}
                        {q.services.length > 2 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            +{q.services.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(q.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelected(q)}
                          title="View detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {q.status === "pending" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => markResolved(q.id)}
                            title="Mark resolved"
                            className="text-success hover:bg-success/10 hover:text-success"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setConfirmDelete(q.id)}
                          title="Delete"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QueryDetailModal
        query={selected}
        onClose={() => setSelected(null)}
        onResolve={(id) => {
          markResolved(id);
          setSelected(null);
        }}
        onDelete={(id) => setConfirmDelete(id)}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Permanently Delete Query?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-foreground">This action cannot be undone!</p>
              <p>The query will be permanently removed from the database including:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Contact information</li>
                <li>Message content</li>
                <li>Attachments (if any)</li>
                <li>All related data</li>
              </ul>
              <p className="text-destructive font-medium mt-3">Are you absolutely sure?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteQuery(confirmDelete)}
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
