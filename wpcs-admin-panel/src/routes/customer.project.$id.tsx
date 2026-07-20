import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCustomerProjects } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileSpreadsheet, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer/project/$id")({
  component: CustomerProjectDetail,
});

function CustomerProjectDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["customer-projects"],
    queryFn: async () => {
      const result = await getCustomerProjects();
      if (!result.success) throw new Error(result.error);
      return result.projects;
    },
  });

  const project = projects?.find((p: any) => p.id === id);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Project not found</p>
        <Button onClick={() => navigate({ to: "/customer/dashboard" })} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/customer/dashboard" })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="mt-2 text-muted-foreground">{project.description}</p>
        </div>

        {project.image && (
          <img
            src={project.image}
            alt={project.name}
            className="h-64 w-full rounded-lg object-cover"
          />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                OneDrive Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Access all project files and documents
              </p>
              <Button
                onClick={() => window.open(project.oneDriveLink, "_blank")}
                className="w-full gap-2"
                disabled={!project.oneDriveLink}
              >
                <ExternalLink className="h-4 w-4" />
                Open OneDrive Folder
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Project Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                View real-time project status and updates
              </p>
              <Button
                onClick={() => window.open(project.projectStatusSheetUrl, "_blank")}
                className="w-full gap-2"
                variant="outline"
                disabled={!project.projectStatusSheetUrl}
              >
                <FileSpreadsheet className="h-4 w-4" />
                View Status Sheet
              </Button>
            </CardContent>
          </Card>
        </div>

        {project.projectStatusSheetUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Project Status Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <iframe
                  src={project.projectStatusSheetUrl}
                  width="100%"
                  height="600px"
                  frameBorder="0"
                  className="bg-white"
                  title="Project Status Sheet"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
