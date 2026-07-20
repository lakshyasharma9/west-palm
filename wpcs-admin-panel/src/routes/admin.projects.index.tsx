import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Building2, MapPin, Trash2, ImagePlus, Edit, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useStore } from "@/lib/store";
import * as api from "@/lib/api";
import type { Project } from "@/lib/mockData";

export const Route = createFileRoute("/admin/projects/")({
  component: ProjectsPage,
});

const TYPES: Project["type"][] = ["Residential", "Commercial", "Mixed-Use", "Industrial"];

function ProjectsPage() {
  const { projects, refreshProjects } = useStore();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<Project["type"]>("Residential");
  const [banner, setBanner] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Data automatically fetched by React Query
    // No need to manually refresh on mount
  }, []);

  const reset = () => {
    setName("");
    setAddress("");
    setType("Residential");
    setBanner("");
    setBannerFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setEditingProject(null);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setAddress(project.address);
    setType(project.type);
    
    // Set banner preview if exists
    if (project.bannerUrl) {
      const imageUrl = project.bannerUrl.startsWith('projects/') || project.bannerUrl.startsWith('attachments/')
        ? `https://west-palm-files.s3.eu-north-1.amazonaws.com/${project.bannerUrl}`
        : project.bannerUrl;
      setBanner(imageUrl);
    }
    
    setOpen(true);
  };

  const onBannerChange = (file: File | null) => {
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => setBanner(String(reader.result));
    reader.readAsDataURL(file);
  };

  const create = async () => {
    if (!name.trim() || !address.trim()) {
      toast.error("Name and address are required");
      return;
    }

    setCreating(true);
    
    try {
      const projectData: any = {
        name: name.trim(),
        address: address.trim(),
        type,
        status: "Planning"
      };

      // Only upload new image if a new file was selected
      if (bannerFile) {
        setIsUploading(true);
        toast.info("Uploading image...");
        
        const uploadResult = await api.uploadToS3(bannerFile, (progress) => {
          setUploadProgress(progress);
        });

        if (!uploadResult.success) {
          toast.error(uploadResult.error || "Failed to upload image");
          setCreating(false);
          setIsUploading(false);
          return;
        }

        projectData.bannerUrl = uploadResult.fileKey;
        projectData.heroUrl = uploadResult.fileKey;
        
        toast.success("Image uploaded successfully");
        setIsUploading(false);
      } else if (editingProject && editingProject.bannerUrl) {
        // Keep existing banner if no new file selected during edit
        projectData.bannerUrl = editingProject.bannerUrl;
        projectData.heroUrl = editingProject.heroUrl || editingProject.bannerUrl;
      }
      
      // Check if editing or creating
      if (editingProject) {
        // Update existing project
        const result = await api.updateProject(editingProject.id, projectData);
        
        if (result.success) {
          toast.success("Project updated successfully");
          
          // Force immediate refresh to show updated data
          await refreshProjects();
          
          setOpen(false);
          reset();
        } else {
          toast.error(result.error || "Failed to update project");
        }
      } else {
        // Create new project
        const result = await api.createProject(projectData);
        
        if (result.success) {
          toast.success("Project created");
          refreshProjects();
          setOpen(false);
          reset();
        } else {
          toast.error(result.error || "Failed to create project");
        }
      }
    } catch (error) {
      toast.error(editingProject ? "Failed to update project" : "Failed to create project");
    } finally {
      setCreating(false);
      setIsUploading(false);
    }
  };

  const remove = async (id: string) => {
    const result = await api.deleteProject(id);
    if (result.success) {
      toast.success("Project deleted");
      refreshProjects(); // Invalidate cache
      setConfirmDelete(null);
    } else {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage public-facing project pages.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No projects yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <Link
                to="/admin/projects/$id"
                params={{ id: p.id }}
                className="block aspect-[16/9] overflow-hidden bg-muted"
              >
                {p.bannerUrl ? (
                  <img
                    src={
                      p.bannerUrl.startsWith('projects/') || p.bannerUrl.startsWith('attachments/')
                        ? `https://west-palm-files.s3.eu-north-1.amazonaws.com/${p.bannerUrl}`
                        : p.bannerUrl.startsWith('http')
                        ? p.bannerUrl
                        : p.bannerUrl
                    }
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      console.error('Image failed to load:', p.bannerUrl);
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-sm">Image not found</div>';
                      }
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to="/admin/projects/$id"
                    params={{ id: p.id }}
                    className="text-base font-semibold text-foreground hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {p.type}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {p.address}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{p.status}</span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditDialog(p);
                      }}
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      title="Edit project"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDelete(p.id);
                      }}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            <DialogDescription>
              {editingProject ? 'Update project details below.' : 'You can edit detailed sections after creating the project.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <label
                className="flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 hover:bg-muted relative"
              >
                {banner ? (
                  <img src={banner} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImagePlus className="mx-auto h-6 w-6" />
                    <p className="mt-1 text-xs">Click to upload</p>
                  </div>
                )}
                
                {/* Upload Progress Overlay */}
                {isUploading && uploadProgress > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-white mb-2 animate-pulse" />
                    <div className="w-3/4 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-white text-sm mt-2 font-medium">{uploadProgress}%</p>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onBannerChange(e.target.files?.[0] ?? null)}
                  disabled={isUploading}
                />
              </label>
              {bannerFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {bannerFile.name} ({(bannerFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pname">Project Name</Label>
              <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paddr">Project Address</Label>
              <Input id="paddr" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Project["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={create} disabled={creating || isUploading}>
              {isUploading ? `Uploading... ${uploadProgress}%` : creating ? (editingProject ? 'Updating...' : 'Creating...') : (editingProject ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Permanently Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-foreground">This action cannot be undone!</p>
              <p>The project and all its data will be permanently deleted from the database:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Project details and specifications</li>
                <li>Gallery images and videos</li>
                <li>All sections and content</li>
              </ul>
              <p className="text-destructive font-medium mt-3">Are you absolutely sure?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && remove(confirmDelete)}
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
