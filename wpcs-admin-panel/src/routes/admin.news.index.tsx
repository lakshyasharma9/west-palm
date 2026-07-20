import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNews, deleteNews } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Calendar, Loader2, Newspaper, Eye } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/news/")({
  component: NewsPage,
});

const NEWS_TYPES = {
  news: { label: "News", color: "bg-blue-100 text-blue-800 border-blue-200" },
  event: { label: "Event", color: "bg-purple-100 text-purple-800 border-purple-200" },
  announcement: { label: "Announcement", color: "bg-orange-100 text-orange-800 border-orange-200" },
};

function NewsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const result = await getNews();
      if (!result.success) throw new Error(result.error);
      return result.news;
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
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      setDeletingId(null);
    },
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setDeletingId(id);
      await deleteMutation.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">News & Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage news, events, and announcements
          </p>
        </div>
        <Link to="/admin/news/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create News
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item: any) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col gap-2">
                  <span className={`w-fit rounded-full border px-2 py-1 text-xs font-medium ${NEWS_TYPES[item.type as keyof typeof NEWS_TYPES]?.color || NEWS_TYPES.news.color}`}>
                    {NEWS_TYPES[item.type as keyof typeof NEWS_TYPES]?.label || 'News'}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDate(item.publishDate)}
                    </span>
                  </div>
                </div>
                <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadge(item.status || 'published')}`}>
                  {item.status || 'published'}
                </span>
              </div>

              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground">
                {item.title}
              </h3>

              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                {item.excerpt}
              </p>

              {item.type === 'event' && item.eventDate && (
                <div className="mb-4 rounded-md bg-purple-50 p-2 text-xs">
                  <div className="font-medium text-purple-900">Event Date:</div>
                  <div className="text-purple-700">{formatDate(item.eventDate)}</div>
                  {item.eventLocation && (
                    <div className="mt-1 text-purple-700">📍 {item.eventLocation}</div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Link to={`/admin/news/${item.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id, item.title)}
                  disabled={deletingId === item.id}
                  className="gap-2"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {item.views > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{item.views} views</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <Newspaper className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">No news yet</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first news item to get started
          </p>
          <Link to="/admin/news/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create News
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
