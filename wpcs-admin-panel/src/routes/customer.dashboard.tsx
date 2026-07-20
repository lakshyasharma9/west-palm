import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCustomerProjects } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  FolderOpen,
  MapPin,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/customer/dashboard")({
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { isAuthenticated, role, username, logout } = useAuth();

  if (!isAuthenticated || role !== "customer") {
    return <Navigate to="/login" />;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ["customer-projects"],
    queryFn: async () => {
      const result = await getCustomerProjects();
      if (!result.success) throw new Error(result.error);
      return result;
    },
  });

  const projects = data?.projects ?? [];
  const customerInfo = data?.customerInfo;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/West_Palm_Logo-removebg-preview.png"
              alt="West Palm Logo"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Customer Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{username}</span>
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">

        {/* Customer-Level Links Section */}
        {customerInfo && (customerInfo.oneDriveLink || customerInfo.projectStatusSheetUrl) && (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              Your Resources
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Quick access to your shared files and project tracker
            </p>
            <div className="flex flex-wrap gap-3">
              {customerInfo.oneDriveLink && (
                <Button
                  className="gap-2"
                  onClick={() => window.open(customerInfo.oneDriveLink, "_blank")}
                  style={{ background: "var(--gradient-gold)", color: "var(--primary-foreground)" }}
                >
                  <FolderOpen className="h-4 w-4" />
                  Open OneDrive Folder
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {customerInfo.projectStatusSheetUrl && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(customerInfo.projectStatusSheetUrl, "_blank")}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  View Project Status Sheet
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Inline Excel embed */}
            {customerInfo.projectStatusSheetUrl && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-foreground">
                  Project Status Sheet (Inline View)
                </p>
                <div className="overflow-hidden rounded-lg border">
                  <iframe
                    src={customerInfo.projectStatusSheetUrl}
                    width="100%"
                    height="500px"
                    frameBorder="0"
                    className="bg-white"
                    title="Project Status Sheet"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Projects Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {projects.length > 0
                ? `${projects.length} project${projects.length > 1 ? "s" : ""} assigned to your account`
                : "No projects assigned yet"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-destructive/30">
              <p className="text-sm text-destructive">Failed to load projects. Please refresh.</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">No projects assigned</p>
              <p className="text-sm text-muted-foreground">
                Contact your administrator to get projects assigned
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const hasOneDrive = !!project.oneDriveLink;
  const hasStatusSheet = !!project.projectStatusSheetUrl;

  return (
    <div className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Project Image */}
      <div className="relative h-44 overflow-hidden bg-muted">
        {project.images && project.images.length > 0 ? (
          <img
            src={project.images[0]}
            alt={project.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        {project.type && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {project.type}
          </span>
        )}
      </div>

      {/* Project Info */}
      <div className="p-5">
        <h3 className="mb-1 text-lg font-semibold text-foreground leading-tight">
          {project.name}
        </h3>

        {project.location && (
          <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        )}

        {project.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}

        {/* Links */}
        {(hasOneDrive || hasStatusSheet) ? (
          <div className="flex flex-col gap-2 mt-3">
            {hasOneDrive && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between gap-2"
                onClick={() => window.open(project.oneDriveLink, "_blank")}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-amber-500" />
                  View OneDrive
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
            {hasStatusSheet && (
              <Button
                size="sm"
                className="w-full justify-between gap-2"
                style={{ background: "var(--gradient-green)", color: "var(--primary-foreground)" }}
                onClick={() => window.open(project.projectStatusSheetUrl, "_blank")}
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Project Status Sheet
                </span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground italic">
            No links attached to this project
          </p>
        )}
      </div>
    </div>
  );
}
