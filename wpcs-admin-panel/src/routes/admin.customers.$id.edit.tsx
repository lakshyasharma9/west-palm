import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, updateCustomer, getProjects } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/customers/$id/edit")({
  component: EditCustomer,
});

function EditCustomer() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    companyName: "",
    oneDriveLink: "",
    projectStatusSheetUrl: "",
    password: "",
    projectIds: [] as string[],
  });

  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const result = await getCustomers();
      if (!result.success) throw new Error(result.error);
      return result.customers;
    },
  });

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const result = await getProjects();
      if (!result.success) throw new Error(result.error);
      return result.projects;
    },
  });

  const customer = customers?.find((c: any) => c.customerId === id);

  useEffect(() => {
    if (customer) {
      setFormData({
        username: customer.username || "",
        email: customer.email || "",
        companyName: customer.companyName || "",
        oneDriveLink: customer.oneDriveLink || "",
        projectStatusSheetUrl: customer.projectStatusSheetUrl || "",
        password: "",
        projectIds: customer.projectIds || [],
      });
    }
  }, [customer]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate({ to: "/admin/customers" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {
      username: formData.username,
      email: formData.email,
      companyName: formData.companyName,
      oneDriveLink: formData.oneDriveLink,
      projectStatusSheetUrl: formData.projectStatusSheetUrl,
      projectIds: formData.projectIds,
    };
    if (formData.password) {
      updateData.password = formData.password;
    }
    updateMutation.mutate(updateData);
  };

  const toggleProject = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter((id) => id !== projectId)
        : [...prev.projectIds, projectId],
    }));
  };

  if (loadingCustomers || loadingProjects) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Customer not found</p>
        <Button onClick={() => navigate({ to: "/admin/customers" })} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/admin/customers" })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Edit Customer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update customer account details and project assignments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password to change"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oneDriveLink">OneDrive Link</Label>
              <Input
                id="oneDriveLink"
                type="url"
                value={formData.oneDriveLink}
                onChange={(e) => setFormData({ ...formData, oneDriveLink: e.target.value })}
                placeholder="https://onedrive.live.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectStatusSheetUrl">Project Status Sheet URL</Label>
              <Input
                id="projectStatusSheetUrl"
                type="url"
                value={formData.projectStatusSheetUrl}
                onChange={(e) =>
                  setFormData({ ...formData, projectStatusSheetUrl: e.target.value })
                }
                placeholder="https://onedrive.live.com/embed?..."
              />
              <p className="text-xs text-muted-foreground">
                Use OneDrive embed URL for Excel sheets
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects && projects.length > 0 ? (
                projects.map((project: any) => (
                  <div key={project.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={project.id}
                      checked={formData.projectIds.includes(project.id)}
                      onCheckedChange={() => toggleProject(project.id)}
                    />
                    <label
                      htmlFor={project.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {project.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No projects available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Customer
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/admin/customers" })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
