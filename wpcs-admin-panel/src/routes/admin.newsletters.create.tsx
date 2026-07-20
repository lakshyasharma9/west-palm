import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { createNewsletter, uploadToS3 } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ArrowLeft, Loader2, Upload, X, Save, Send, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsletters/create")({
  component: CreateNewsletterPage,
});

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function CreateNewsletterPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    month: currentMonth.toString(),
    year: currentYear.toString(),
    coverImage: "",
    status: "draft",
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [] as string[],
    },
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");

  const createMutation = useMutation({
    mutationFn: createNewsletter,
    onSuccess: () => {
      navigate({ to: "/admin/newsletters" });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
      seo: {
        ...formData.seo,
        metaTitle: title,
      },
    });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        seo: {
          ...formData.seo,
          keywords: [...formData.seo.keywords, keywordInput.trim()],
        },
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      seo: {
        ...formData.seo,
        keywords: formData.seo.keywords.filter(k => k !== keyword),
      },
    });
  };

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

    await createMutation.mutateAsync({
      ...formData,
      month: parseInt(formData.month),
      year: parseInt(formData.year),
      coverImage: coverImageUrl,
      status: publishNow ? 'published' : 'draft',
    });
  };

  const isSubmitting = createMutation.isPending || uploading;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/newsletters">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new monthly newsletter with rich content
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6 rounded-lg border bg-card p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="month">Month *</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => setFormData({ ...formData, month: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => setFormData({ ...formData, year: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter newsletter title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-friendly-slug"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL: /newsletter/{formData.slug}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary for preview cards..."
                className="min-h-[80px] w-full rounded-lg border bg-background p-3 text-sm"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {formData.excerpt.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Write your newsletter content here..."
              />
            </div>
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

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6 rounded-lg border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.seo.metaTitle}
                onChange={(e) => setFormData({
                  ...formData,
                  seo: { ...formData.seo, metaTitle: e.target.value }
                })}
                placeholder="SEO title for search engines"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.seo.metaTitle.length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <textarea
                id="metaDescription"
                value={formData.seo.metaDescription}
                onChange={(e) => setFormData({
                  ...formData,
                  seo: { ...formData.seo, metaDescription: e.target.value }
                })}
                placeholder="Brief description for search results..."
                className="min-h-[100px] w-full rounded-lg border bg-background p-3 text-sm"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {formData.seo.metaDescription.length}/160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Add keyword and press Enter"
                />
                <Button type="button" onClick={addKeyword} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.seo.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.seo.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e as any, true)}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Send className="h-4 w-4" />
            Publish Now
          </Button>
          <Link to="/admin/newsletters">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
