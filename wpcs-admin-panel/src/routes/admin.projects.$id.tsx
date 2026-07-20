import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, Edit2, Plus, Trash2, ImagePlus, Video, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import * as api from "@/lib/api";
import type { Project } from "@/lib/mockData";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/admin/projects/$id")({
  component: ProjectPreviewPage,
});

const AnimatedNumber = ({ value }: { value: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!nodeRef.current) return;
    const match = value.match(/(\d+)(.*)/);
    if (match) {
      const [, numStr, rest] = match;
      const final = parseInt(numStr, 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: final,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: nodeRef.current, start: "top 90%" },
        onUpdate: () => {
          if (nodeRef.current) nodeRef.current.innerText = Math.round(obj.val) + rest;
        },
      });
    }
  }, [value]);
  return <span ref={nodeRef}>{value}</span>;
};

const SHORT_LABEL: Record<string, string> = {
  "Building Height": "Height",
  "Total Residential Units": "Units",
  "Total Area": "Area",
  "Parking": "Parking",
  "Unit Mix": "Unit Mix",
};

function ProjectPreviewPage() {
  const { id } = Route.useParams();
  const { projects, setProjects, refreshProjects } = useStore();
  const navigate = useNavigate();
  const existing = projects.find((p) => p.id === id);
  const [draft, setDraft] = useState<Project | null>(existing ?? null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!draft) return;

    if (heroImgRef.current) {
      gsap.to(heroImgRef.current, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    gsap.fromTo(
      ".hero-anim",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.3 }
    );

    mainRef.current?.querySelectorAll(".reveal-up").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }
      );
    });

    const specs = mainRef.current?.querySelectorAll(".spec-card");
    if (specs?.length) {
      gsap.fromTo(
        specs,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: "power2.out", scrollTrigger: { trigger: specs[0], start: "top 88%" } }
      );
    }
  }, [draft]);

  if (!draft) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F7F5" }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: "#146321" }}>Project not found</h1>
          <button
            onClick={() => navigate({ to: "/admin/projects" })}
            className="flex items-center gap-2 mx-auto font-semibold hover:underline"
            style={{ color: "#146321" }}
          >
            <ArrowLeft size={18} /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const update = (patch: Partial<Project>) => setDraft({ ...draft, ...patch });

  const addSpec = () => {
    const newSpec = { id: Date.now().toString(), key: 'New Label', value: 'New Value' };
    update({ specs: [...(draft.specs || []), newSpec] });
  };

  const deleteSpec = (index: number) => {
    const newSpecs = draft.specs.filter((_, i) => i !== index);
    update({ specs: newSpecs });
  };

  const uploadGalleryMedia = async (files: File[], mediaType: 'image' | 'video') => {
    if (files.length === 0) return;
    
    const mediaLabel = mediaType === 'image' ? 'image' : 'video';
    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    // Get fresh project data before uploading
    const freshProject = await api.getProjectById(draft.id);
    let currentGallery = freshProject.success ? freshProject.project.gallery || [] : draft.gallery || [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        toast.info(`Uploading ${i + 1}/${files.length}: ${file.name}`);
        
        // Upload using presigned URL with progress tracking
        const uploadResult = await api.uploadToS3(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [i]: progress }));
        });

        if (!uploadResult.success) {
          toast.error(`Failed to upload ${file.name}`);
          failCount++;
          continue;
        }

        // Add to gallery
        const newItem = {
          id: Date.now().toString() + i,
          type: mediaType,
          url: uploadResult.fileKey!,
          name: file.name
        };

        currentGallery = [...currentGallery, newItem];
        
        // Update backend
        const result = await api.updateProject(draft.id, { gallery: currentGallery });
        if (result.success && result.project) {
          update({ gallery: result.project.gallery || currentGallery });
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('Upload error:', error);
        failCount++;
      }
    }

    setIsUploading(false);
    setUploadProgress({});
    
    if (successCount > 0) {
      toast.success(`${successCount} ${mediaLabel}(s) uploaded successfully`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} ${mediaLabel}(s) failed to upload`);
    }
  };

  const deleteGalleryItem = async (index: number) => {
    const newGallery = (draft.gallery || []).filter((_, i) => i !== index);
    update({ gallery: newGallery });
    // Save to backend immediately
    try {
      await api.updateProject(draft.id, { gallery: newGallery });
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const result = await api.updateProject(draft.id, draft);
      if (result.success) {
        setProjects((prev) => prev.map((p) => (p.id === draft.id ? result.project : p)));
        toast.success("Project saved successfully");
        setEditMode(null);
        // React Query will automatically update cache
        refreshProjects();
      } else {
        toast.error(result.error || "Failed to save project");
      }
    } catch (error) {
      toast.error("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (field: keyof Project, file: File) => {
    try {
      toast.info("Uploading image...");
      setIsUploading(true);
      
      // Upload using presigned URL
      const uploadResult = await api.uploadToS3(file, (progress) => {
        setUploadProgress({ 0: progress });
      });

      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Failed to upload image");
        setIsUploading(false);
        return;
      }

      // Update project with S3 key
      const updateData: any = {};
      if (field === 'heroUrl') {
        updateData.heroUrl = uploadResult.fileKey;
      }

      const result = await api.updateProject(draft.id, updateData);
      if (result.success && result.project) {
        update({ [field]: result.project[field] });
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to update project");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('projects/') || url.startsWith('attachments/')) {
      return `https://west-palm-files.s3.eu-north-1.amazonaws.com/${url}`;
    }
    return url;
  };

  const allDetails = Object.entries(draft.specs || []).map(spec => [spec.key, spec.value]);
  const statsDetails = (draft.heroStats || []).slice(0, 4);
  const teamDetails = allDetails.slice(4);

  // Add dummy data if fields are empty
  useEffect(() => {
    if (!draft) return;
    
    const needsDummyData = !draft.heroStats || draft.heroStats.length === 0;
    if (needsDummyData) {
      const dummyData: Partial<Project> = {};
      
      if (!draft.heroStats || draft.heroStats.length === 0) {
        dummyData.heroStats = [
          { id: '1', key: 'Building Height', value: '16 stories' },
          { id: '2', key: 'Total Residential Units', value: '334 Units' },
          { id: '3', key: 'Parking', value: '426 spaces' },
          { id: '4', key: 'Unit Mix', value: 'Studio, 1-3 BR' },
        ];
      }
      
      if (!draft.specs || draft.specs.length === 0) {
        dummyData.specs = [
          { id: '1', key: 'Building Height', value: '16 stories' },
          { id: '2', key: 'Total Residential Units', value: '334 Units' },
          { id: '3', key: 'Parking', value: '426 spaces (4 floor Parking)' },
          { id: '4', key: 'Unit Mix', value: '34 workforce housing units' },
          { id: '5', key: 'Owner / Developer', value: 'Ram Realty Services & Pinnacle Communities' },
          { id: '6', key: 'General Contractor', value: 'Kaufman Lynn' },
          { id: '7', key: 'Shell Contractor', value: 'KD Construction' },
          { id: '8', key: 'Architect', value: 'Baker Barrios Architects' },
        ];
      }
      
      if (!(draft.overview as any)?.vision) {
        dummyData.overview = {
          vision: 'This is a planned multifamily residential tower strategically positioned to support modern urban development. Click edit to customize this description.',
          sustainability: 'The project integrates sustainable design principles and modern construction technology. Click edit to add your sustainability features.',
        };
      }
      
      setDraft({ ...draft, ...dummyData });
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7F5" }} ref={mainRef}>
      {/* Fixed Admin Controls */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/admin/projects" })}
          className="bg-white"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Projects
        </Button>
        <Button size="sm" onClick={save} disabled={saving} style={{ backgroundColor: "#146321" }} className="text-white hover:opacity-90">
          <Save className="mr-1.5 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100svh", minHeight: 650, maxHeight: 950 }}
      >
        <div className="absolute inset-0 group">
          {draft.heroUrl && getImageUrl(draft.heroUrl) ? (
            <img
              ref={heroImgRef}
              src={getImageUrl(draft.heroUrl)!}
              alt={draft.name}
              className="w-full h-full object-cover"
              style={{ transformOrigin: "center top" }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <p className="text-white text-lg">No Hero Image</p>
            </div>
          )}

          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e: any) => {
                const file = e.target?.files?.[0];
                if (file) uploadImage("heroUrl", file);
              };
              input.click();
            }}
            className="absolute top-4 left-4 bg-white/90 hover:bg-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-auto"
            style={{ pointerEvents: 'auto' }}
          >
            <Edit2 size={16} />
          </button>
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8,24,10,0.95) 0%, rgba(8,24,10,0.65) 28%, rgba(8,24,10,0.20) 55%, transparent 100%)",
          }}
        />

        <div className="absolute top-0 left-0 right-0 z-20 pt-8 md:pt-10">
          <div style={{ maxWidth: "1400px", margin: "0 auto", paddingLeft: "clamp(40px, 6vw, 100px)", paddingRight: "clamp(40px, 6vw, 100px)" }}>
            <button
              onClick={() => navigate({ to: "/admin/projects" })}
              className="group flex items-center gap-2 text-white/55 hover:text-white transition-colors duration-300 text-[10px] font-bold tracking-[0.2em] uppercase"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Projects
            </button>
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{ paddingBottom: "clamp(40px, 6vh, 80px)" }}
        >
          <div className="pointer-events-auto" style={{ marginLeft: "clamp(40px, 5vw, 80px)" }}>
            <div className="relative group mb-4">
              {editMode !== "type" ? (
                <>
                  <p
                    className="hero-anim font-bold uppercase tracking-[0.28em]"
                    style={{ fontSize: "10px", color: "#D4AF37", marginBottom: "clamp(18px, 2.5vh, 28px)" }}
                  >
                    [ {draft.type} ]
                  </p>
                  <button
                    onClick={() => setEditMode("type")}
                    className="absolute left-0 -bottom-8 bg-white/90 hover:bg-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-20 shadow-lg"
                    style={{ pointerEvents: 'auto' }}
                    title="Edit project type"
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              ) : (
                <div className="flex gap-2 items-center mb-4">
                  <Input
                    value={draft.type}
                    onChange={(e) => update({ type: e.target.value as any })}
                    className="bg-white w-64"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => setEditMode(null)}>Done</Button>
                </div>
              )}
            </div>

            <div className="relative group mb-4">
              {editMode !== "title" ? (
                <>
                  <h1
                    className="hero-anim font-[family-name:var(--font-heading)]"
                    style={{
                      fontSize: "clamp(3.5rem, 8vw, 7rem)",
                      lineHeight: 1.04,
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                      marginBottom: "clamp(20px, 3vh, 32px)",
                      color: "#ffffff",
                    }}
                  >
                    {draft.name}
                  </h1>
                  <button
                    onClick={() => setEditMode("title")}
                    className="absolute left-0 -bottom-8 bg-white/90 hover:bg-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-20 shadow-lg"
                    style={{ pointerEvents: 'auto' }}
                    title="Edit project name"
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              ) : (
                <div className="flex gap-2 items-center mb-4">
                  <Input
                    value={draft.name}
                    onChange={(e) => update({ name: e.target.value })}
                    className="bg-white text-2xl"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => setEditMode(null)}>Done</Button>
                </div>
              )}
            </div>

            <div
              className="hero-anim"
              style={{ width: "clamp(120px, 20vw, 280px)", height: "1.5px", backgroundColor: "#D4AF37", marginBottom: "clamp(20px, 3vh, 32px)" }}
            />

            {statsDetails.length > 0 && (
              <div className="hero-anim flex flex-row flex-wrap items-center gap-x-8 md:gap-x-12 lg:gap-x-16 gap-y-4">
                {statsDetails.map((stat, i) => (
                  <div key={i} className="relative group">
                    {editMode !== `stat-${i}` ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold uppercase tracking-[0.15em]"
                            style={{ fontSize: "9px", color: "#D4AF37" }}
                          >
                            {SHORT_LABEL[stat.key] ?? stat.key}:
                          </span>
                          <span
                            className="text-white font-medium"
                            style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.15rem)", letterSpacing: "0.01em" }}
                          >
                            <AnimatedNumber value={stat.value} />
                          </span>
                        </div>
                        <button
                          onClick={() => setEditMode(`stat-${i}`)}
                          className="absolute left-0 -bottom-6 bg-white/90 hover:bg-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-20 shadow-lg"
                          style={{ pointerEvents: 'auto' }}
                          title="Edit stat"
                        >
                          <Edit2 size={12} />
                        </button>
                      </>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          value={stat.key}
                          onChange={(e) => {
                            const next = [...draft.heroStats];
                            next[i] = { ...next[i], key: e.target.value };
                            update({ heroStats: next });
                          }}
                          className="bg-white w-32"
                          placeholder="Label"
                        />
                        <Input
                          value={stat.value}
                          onChange={(e) => {
                            const next = [...draft.heroStats];
                            next[i] = { ...next[i], value: e.target.value };
                            update({ heroStats: next });
                          }}
                          className="bg-white w-32"
                          placeholder="Value"
                        />
                        <Button size="sm" onClick={() => setEditMode(null)}>Done</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* OVERVIEW SECTION */}
      <section style={{ backgroundColor: "#F5F1E8" }}>
        <div style={{ paddingTop: "clamp(80px, 10vh, 120px)", paddingBottom: "clamp(80px, 10vh, 120px)", paddingLeft: "clamp(40px, 6vw, 100px)", paddingRight: "clamp(40px, 6vw, 100px)" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              <div className="lg:col-span-4 reveal-up">
                <p 
                  className="font-bold uppercase tracking-[0.25em] mb-6"
                  style={{ fontSize: "10px", color: "#D4AF37" }}
                >
                  [ OVERVIEW ]
                </p>
                <h2
                  className="font-[family-name:var(--font-heading)] mb-8"
                  style={{ 
                    fontSize: "clamp(2.5rem, 4vw, 3.5rem)", 
                    lineHeight: 1.1,
                    fontWeight: 400,
                    color: "#1a1a1a",
                    letterSpacing: "-0.01em"
                  }}
                >
                  Project Overview
                </h2>
                <div style={{ width: "80px", height: "3px", backgroundColor: "#D4AF37" }} />
              </div>
              <div className="lg:col-span-8 reveal-up">
                <div className="relative group mb-6">
                  {editMode !== "vision" ? (
                    <>
                      <p
                        className="font-semibold"
                        style={{ 
                          fontSize: "clamp(1.15rem, 2vw, 1.35rem)", 
                          lineHeight: 1.6,
                          color: "#1a1a1a",
                          fontWeight: 600
                        }}
                      >
                        {(draft.overview as any)?.vision || draft.address || "Click edit to add project vision"}
                      </p>
                      <button
                        onClick={() => setEditMode("vision")}
                        className="absolute -right-8 top-0 bg-white/90 hover:bg-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-20"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        value={(draft.overview as any)?.vision || ""}
                        onChange={(e) =>
                          update({ overview: { ...(draft.overview as any), vision: e.target.value } })
                        }
                        className="bg-white min-h-[120px]"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => setEditMode(null)}>Done</Button>
                    </div>
                  )}
                </div>

                <div style={{ width: "80px", height: "3px", backgroundColor: "#D4AF37", marginBottom: "clamp(24px, 3vh, 32px)" }} />

                <div className="relative group">
                  {editMode !== "sustainability" ? (
                    <>
                      <p
                        style={{ 
                          fontSize: "clamp(1rem, 1.5vw, 1.1rem)", 
                          lineHeight: 1.8,
                          color: "#666666",
                          fontWeight: 400
                        }}
                      >
                        {(draft.overview as any)?.sustainability || "Click edit to add sustainability details"}
                      </p>
                      <button
                        onClick={() => setEditMode("sustainability")}
                        className="absolute -right-8 top-0 bg-white/90 hover:bg-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-20"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        value={(draft.overview as any)?.sustainability || ""}
                        onChange={(e) =>
                          update({ overview: { ...(draft.overview as any), sustainability: e.target.value } })
                        }
                        className="bg-white min-h-[120px]"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => setEditMode(null)}>Done</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIFICATIONS SECTION */}
      {draft.specs && draft.specs.length > 0 && (
        <section style={{ backgroundColor: "#0d3d1a" }}>
          <div style={{ paddingTop: "clamp(100px, 12vh, 140px)", paddingBottom: "clamp(100px, 12vh, 140px)", paddingLeft: "clamp(40px, 6vw, 100px)", paddingRight: "clamp(40px, 6vw, 100px)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              <div className="mb-20 reveal-up flex items-center justify-between">
                <div>
                  <p 
                    className="font-bold uppercase mb-8"
                    style={{ fontSize: "10px", color: "#D4AF37", letterSpacing: "0.25em" }}
                  >
                    [ PROJECT DETAILS ]
                  </p>
                  <h2
                    className="font-[family-name:var(--font-heading)]"
                    style={{ 
                      fontSize: "clamp(3rem, 5vw, 4.5rem)", 
                      lineHeight: 1.1,
                      fontWeight: 400,
                      color: "#ffffff",
                      fontStyle: "italic",
                      letterSpacing: "-0.01em",
                      marginBottom: "40px"
                    }}
                  >
                    Specifications
                  </h2>
                </div>
                <Button
                  onClick={addSpec}
                  size="sm"
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Box
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {draft.specs.map((spec, i) => (
                  <div
                    key={spec.id}
                    className="spec-card relative group"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "12px",
                      padding: "clamp(32px, 5vh, 48px) clamp(28px, 4vw, 40px)"
                    }}
                  >
                    {editMode !== `spec-${i}` ? (
                      <>
                        <dt 
                          className="font-bold uppercase"
                          style={{ 
                            fontSize: "10px", 
                            color: "#D4AF37", 
                            letterSpacing: "0.15em",
                            marginBottom: "clamp(16px, 2vh, 24px)"
                          }}
                        >
                          {spec.key}
                        </dt>
                        <dd 
                          style={{ 
                            fontSize: i < 4 ? "clamp(1.75rem, 3vw, 2.5rem)" : "clamp(1.15rem, 1.8vw, 1.5rem)", 
                            lineHeight: 1.4,
                            color: "#ffffff",
                            fontWeight: 400
                          }}
                        >
                          {i < 4 ? <AnimatedNumber value={spec.value} /> : spec.value}
                        </dd>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditMode(`spec-${i}`)}
                            className="bg-white/90 hover:bg-white p-1.5 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteSpec(i)}
                            className="bg-red-500/90 hover:bg-red-500 p-1.5 rounded text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          value={spec.key}
                          onChange={(e) => {
                            const next = [...draft.specs];
                            next[i] = { ...next[i], key: e.target.value };
                            update({ specs: next });
                          }}
                          className="bg-white"
                          placeholder="Label"
                        />
                        <Input
                          value={spec.value}
                          onChange={(e) => {
                            const next = [...draft.specs];
                            next[i] = { ...next[i], value: e.target.value };
                            update({ specs: next });
                          }}
                          className="bg-white"
                          placeholder="Value"
                        />
                        <Button size="sm" onClick={() => setEditMode(null)}>Done</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GALLERY SECTION */}
      <section style={{ backgroundColor: "#F5F1E8" }}>
        <div style={{ paddingTop: "clamp(80px, 10vh, 120px)", paddingBottom: "clamp(80px, 10vh, 120px)", paddingLeft: "clamp(40px, 6vw, 100px)", paddingRight: "clamp(40px, 6vw, 100px)" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div className="mb-16 reveal-up flex items-center justify-between">
              <div>
                <p 
                  className="font-bold uppercase mb-6"
                  style={{ fontSize: "10px", color: "#D4AF37", letterSpacing: "0.25em" }}
                >
                  [ VISUAL ]
                </p>
                <h2
                  className="font-[family-name:var(--font-heading)]"
                  style={{ 
                    fontSize: "clamp(2.5rem, 4vw, 3.5rem)", 
                    lineHeight: 1.1,
                    fontWeight: 400,
                    color: "#1a1a1a",
                    letterSpacing: "-0.01em",
                    marginBottom: "clamp(20px, 3vh, 32px)"
                  }}
                >
                  Project Gallery
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black"
                  onClick={(e) => {
                    e.preventDefault();
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = (e: any) => {
                      const files = Array.from(e.target?.files || []) as File[];
                      uploadGalleryMedia(files, 'image');
                    };
                    input.click();
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Upload className="mr-1.5 h-4 w-4 animate-pulse" />
                  ) : (
                    <ImagePlus className="mr-1.5 h-4 w-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Add Images'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#146321] hover:bg-[#146321]/90 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.multiple = true;
                    input.onchange = (e: any) => {
                      const files = Array.from(e.target?.files || []) as File[];
                      uploadGalleryMedia(files, 'video');
                    };
                    input.click();
                  }}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Upload className="mr-1.5 h-4 w-4 animate-pulse" />
                  ) : (
                    <Video className="mr-1.5 h-4 w-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Add Videos'}
                </Button>
              </div>
            </div>

            {(!draft.gallery || draft.gallery.length === 0) ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-500">No media yet. Click "Add Images" or "Add Videos" to upload.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {draft.gallery.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="relative group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-gray-100 relative">
                      {item.type === 'video' ? (
                        <>
                          <video
                            src={item.url.startsWith('http') || item.url.startsWith('data:') 
                              ? item.url 
                              : `https://west-palm-files.s3.eu-north-1.amazonaws.com/${item.url}`
                            }
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                          />
                          <div className="absolute top-2 left-2 bg-[#146321] text-white px-2 py-1 rounded text-xs font-semibold">
                            VIDEO
                          </div>
                        </>
                      ) : (
                        <img
                          src={item.url.startsWith('http') || item.url.startsWith('data:') 
                            ? item.url 
                            : `https://west-palm-files.s3.eu-north-1.amazonaws.com/${item.url}`
                          }
                          alt={item.name || `Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => deleteGalleryItem(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
