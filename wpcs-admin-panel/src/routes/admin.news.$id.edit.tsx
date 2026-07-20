import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNewsById, updateNews, uploadToS3 } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Upload, X, Save, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/news/$id/edit")({
  component: EditNewsPage,
});

function EditNewsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    type: "news",
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    publishDate: "",
    priority: "3",
    status: "draft",
    eventDate: "",
    eventLocation: "",
    eventLink: "",
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: newsItem, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: async () => {
      const result = await getNewsById(id);
      if (!result.success) throw new Error(result.error);
      return result.news;
    },
  });

  useEffect(() => {
    if (newsItem && !isLoaded) {
      setFormData({
        type: newsItem.type || "news",
        title: newsItem.title || "",
        excerpt: newsItem.excerpt || "",
        content: newsItem.content || "",
        coverImage: newsItem.coverImage || "",
        publishDate: newsItem.publishDate || "",
        priority: newsItem.priority?.toString() || "3",
        status: newsItem.status || "draft",
        eventDate: newsItem.eventDate || "",
        eventLocation: newsItem.eventLocation || "",
        eventLink: newsItem.eventLink || "",
      });

      if (newsItem.coverImage) {
        const s3Url = newsItem.coverImage.startsWith('http')
          ? newsItem.coverImage
          : `https://west-palm-files.s3.eu-north-1.amazonaws.com/${newsItem.coverImage}`;
        setCoverPreview(s3Url);
      }

      setIsLoaded(true);
    }
  }, [newsItem, isLoaded]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateNews(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["news", id] });
      navigate({ to: "/admin/news" });
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
    setFormData({ ...formData, coverImage: "" });
  };

  const handleSubmit = async (e: React.FormEvent, publishNow: boolean = false) => {
    e.preventDefault();

    let coverImageUrl = formData.coverImage;

    if (coverFile) {
      setUploading(true);
      const uploadResult = await uploadToS3(coverFile);
      setUploading(false);

      if (!uploadResult.success) {
        alert("Failed to upload cover image");
        return;
      }

      coverImageUrl = uploadResult.fileKey || "";
    }

    await updateMutation.mutateAsync({
      ...formData,
      priority: parseInt(formData.priority),
      coverImage: coverImageUrl,
      status: publishNow ? 'published' : formData.status,
    });
  };

  const isSubmitting = updateMutation.isPending || uploading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/news">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit News</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update news item, event, or announcement
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter news title"
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (for ticker) *</Label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief 1-2 line summary for ticker..."
                className="min-h-[60px] w-full rounded-lg border bg-background p-3 text-sm"
                maxLength={150}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.excerpt.length}/150 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Full Content *</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write full content (2-3 paragraphs)..."
                className="min-h-[200px] w-full rounded-lg border bg-background p-3 text-sm"
                required
              />
            </div>

            {formData.type === 'event' && (
              <div className="space-y-4 rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                <h3 className="font-semibold text-purple-900">Event Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate ? new Date(formData.eventDate).toISOString().slice(0, 16) : ""}
                    onChange={(e) => setFormData({ ...formData, eventDate: new Date(e.target.value).toISOString() })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Event Location</Label>
                  <Input
                    id="eventLocation"
                    value={formData.eventLocation}
                    onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                    placeholder="e.g., Miami Convention Center"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventLink">Event Link</Label>
                  <Input
                    id="eventLink"
                    type="url"
                    value={formData.eventLink}
                    onChange={(e) => setFormData({ ...formData, eventLink: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image</Label>
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-64 w-full rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={removeCover}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-accent">
                  <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Click to upload cover image
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date *</Label>
              <Input
                id="publishDate"
                type="datetime-local"
                value={formData.publishDate ? new Date(formData.publishDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, publishDate: new Date(e.target.value).toISOString() })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Highest</SelectItem>
                  <SelectItem value="2">2 - High</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - Low</SelectItem>
                  <SelectItem value="5">5 - Lowest</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Higher priority items appear first in the ticker
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 rounded-lg border bg-card p-4">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e as any, true)}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Send className="h-4 w-4" />
            Update & Publish
          </Button>
          <Link to="/admin/news">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
