import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNewsletters, deleteNewsletter } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye, Calendar, Loader2, Newspaper, Edit } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/newsletters/")({
  component: NewslettersPage,
});

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function NewslettersPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["newsletters"],
    queryFn: async () => {
      const result = await getNewsletters();
      if (!result.success) throw new Error(result.error);
      return result.newsletters;
    },
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      published: "bg-green-100 text-green-800 border-green-200",
      draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
      archived: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const deleteMutation = useMutation({
    mutationFn: deleteNewsletter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      setDeletingId(null);
    },
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Newsletters</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your monthly newsletters
          </p>
        </div>
        <Link to="/admin/newsletters/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Newsletter
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((newsletter: any) => (
            <div
              key={newsletter.id}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    {MONTHS[newsletter.month - 1]} {newsletter.year}
                  </span>
                </div>
                <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadge(newsletter.status || 'published')}`}>
                  {newsletter.status || 'published'}
                </span>
              </div>

              <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-foreground">
                {newsletter.title}
              </h3>

              <div className="flex gap-2">
                <a
                  href={`${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/newsletter/${newsletter.slug ? `${newsletter.slug}/1` : `${newsletter.year}/${newsletter.month}`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </a>
                <Link to={`/admin/newsletters/${newsletter.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(newsletter.id, newsletter.title)}
                  disabled={deletingId === newsletter.id}
                  className="gap-2"
                >
                  {deletingId === newsletter.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <Newspaper className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No newsletters yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first newsletter to get started
          </p>
          <Link to="/admin/newsletters/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Newsletter
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
