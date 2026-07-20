import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNewsletterById, updateNewsletter, uploadToS3 } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ArrowLeft, Loader2, Upload, X, Save, Send, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/newsletters/$id/edit")({
  component: EditNewsletterPage,
});

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function EditNewsletterPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    month: "",
    year: "",
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch newsletter data
  const { data: newsletter, isLoading } = useQuery({
    queryKey: ["newsletter", id],
    queryFn: async () => {
      const result = await getNewsletterById(id);
      if (!result.success) throw new Error(result.error);
      return result.newsletter;
    },
  });

  // Load newsletter data into form
  useEffect(() => {
    if (newsletter && !isLoaded) {
      // Coerce year/month to numbers first, then to strings
      // DynamoDB may return them as numbers or strings
      const monthNum = Number(newsletter.month);
      const yearNum  = Number(newsletter.year);

      setFormData({
        title: newsletter.title || "",
        slug: newsletter.slug || "",
        content: newsletter.content || "",
        excerpt: newsletter.excerpt || "",
        month: (!isNaN(monthNum) && monthNum > 0) ? monthNum.toString() : new Date().getMonth() + 1 + "",
        year:  (!isNaN(yearNum)  && yearNum  > 0) ? yearNum.toString()  : new Date().getFullYear().toString(),
        coverImage: newsletter.coverImage || "",
        status: newsletter.status || "draft",
        seo: {
          metaTitle: newsletter.seo?.metaTitle || "",
          metaDescription: newsletter.seo?.metaDescription || "",
          keywords: newsletter.seo?.keywords || [],
        },
      });
      
      if (newsletter.coverImage) {
        const s3Url = newsletter.coverImage.startsWith('http') 
          ? newsletter.coverImage 
          : `https://west-palm-files.s3.eu-north-1.amazonaws.com/${newsletter.coverImage}`;
        setCoverPreview(s3Url);
      }
      
      setIsLoaded(true);
    }
  }, [newsletter, isLoaded]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateNewsletter(id, data),
    onSuccess: (result) => {
      if (result && result.success === false) {
        alert(`Save failed: ${result.error || 'Unknown error. Please try again.'}`);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["newsletter", id] });
      navigate({ to: "/admin/newsletters" });
    },
    onError: (error: any) => {
      alert(`Save failed: ${error?.message || 'Network error. Please check your connection and try again.'}`);
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

      coverImageUrl = ('fileKey' in uploadResult && uploadResult.fileKey)
        ? uploadResult.fileKey as string
        : "";
    }

    try {
      const monthNum = parseInt(formData.month);
      const yearNum  = parseInt(formData.year);

      if (isNaN(monthNum) || isNaN(yearNum)) {
        alert('Please select a valid Month and Year before saving.');
        return;
      }

      await updateMutation.mutateAsync({
        ...formData,
        month: monthNum,
        year:  yearNum,
        coverImage: coverImageUrl,
        status: publishNow ? 'published' : formData.status,
      });
    } catch (err: any) {
      // onError on the mutation already shows the alert,
      // but catch here prevents unhandled promise rejection
      console.error('Submit error:', err);
    }
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
        <Link to="/admin/newsletters">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Newsletter</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your newsletter content and settings
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
                key={isLoaded ? `editor-${newsletter?.id}` : "editor-empty"}
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
