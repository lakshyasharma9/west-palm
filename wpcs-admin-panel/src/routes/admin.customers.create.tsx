import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createCustomer, getProjects } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/customers/create")({
  component: CreateCustomerPage,
});

function CreateCustomerPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    companyName: "",
    oneDriveLink: "",
    projectStatusSheetUrl: "",
    projectIds: [] as string[],
  });
  const [error, setError] = useState("");

  // Fetch all projects for assignment
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const result = await getProjects();
      if (!result.success) throw new Error(result.error);
      return result.projects;
    },
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      navigate({ to: "/admin/customers" });
    },
    onError: (error: any) => {
      setError(error.message || "Failed to create customer");
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password || !formData.email) {
      setError("Username, password, and email are required");
      return;
    }

    await createMutation.mutateAsync(formData);
  };

  const toggleProject = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter(id => id !== projectId)
        : [...prev.projectIds, projectId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Customer Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new customer and assign projects
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Account Information</h2>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  required
                  placeholder="customer1"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="customer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="ABC Construction Ltd."
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Project Resources</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oneDriveLink">OneDrive Folder Link</Label>
              <Input
                id="oneDriveLink"
                type="url"
                placeholder="https://onedrive.live.com/..."
                value={formData.oneDriveLink}
                onChange={(e) => setFormData({ ...formData, oneDriveLink: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Link to customer's OneDrive folder with project files
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectStatusSheetUrl">Project Status Sheet URL</Label>
              <Input
                id="projectStatusSheetUrl"
                type="url"
                placeholder="https://onedrive.live.com/embed?..."
                value={formData.projectStatusSheetUrl}
                onChange={(e) => setFormData({ ...formData, projectStatusSheetUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Link to Excel sheet or embed URL for project status tracking
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Assign Projects</h2>
          
          {projects && projects.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {projects.map((project: any) => (
                <label
                  key={project.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={formData.projectIds.includes(project.id)}
                    onChange={() => toggleProject(project.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{project.name}</div>
                    {project.location && (
                      <div className="text-xs text-muted-foreground">{project.location}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No projects available</p>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="gap-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Create Customer
          </Button>
          <Link to="/admin/customers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
