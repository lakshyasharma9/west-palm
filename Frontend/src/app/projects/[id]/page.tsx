"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticButton from "@/components/MagneticButton";
import { getProjectById, getProjects, getS3ImageUrl } from "@/lib/api";
import type { Project, RelatedProject } from "@/types";
import OptimizedImage from "@/components/OptimizedImage";
import GalleryItem from "@/components/GalleryItem";
import { getBlurDataURL } from "@/lib/image-utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

const CONTAINER = "w-full max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20";

// Shortened label map for the hero stats row
const SHORT_LABEL: Record<string, string> = {
  "Building Height": "Height",
  "Total Residential Units": "Units",
  "Total Area": "Area",
  "Parking": "Parking",
  "Unit Mix": "Unit Mix",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<RelatedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const animationsInitialized = useRef(false);

  // Detect mobile on client side only
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clean scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, [params.id]);

  useEffect(() => {
    async function fetchData() {
      try {
        const projectData = await getProjectById(params.id as string);
        
        if (projectData) {
          setProject(projectData);
          
          // Fetch related projects in background
          getProjects().then(allProjects => {
            const related = allProjects
              .filter((p: Project) => p.id !== params.id)
              .map((p: Project): RelatedProject => ({
                id: p.id,
                title: p.name,
                image: getS3ImageUrl(p.bannerUrl) || '/placeholder.jpg',
                address: p.address,
                type: p.type || 'Residential'
              }));
            setRelatedProjects(related);
          });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [params.id]);

  // Memoize animation calculations
  const animationConfig = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return {
      stackDistance: 30,
      baseScale: 0.85,
      itemScale: 0.03,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  }, []);

  useEffect(() => {
    if (!project || !isClient || animationsInitialized.current) return;

    const initTimer = setTimeout(() => {
      animationsInitialized.current = true;
      ScrollTrigger.refresh();

      // Hero parallax
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

      // Hero animations
      gsap.fromTo(
        ".hero-anim",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.3 }
      );

      // Reveal animations
      mainRef.current?.querySelectorAll(".reveal-up").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }
        );
      });

      // Spec cards
      const specs = mainRef.current?.querySelectorAll(".spec-card");
      if (specs?.length) {
        gsap.fromTo(
          specs,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: "power2.out", scrollTrigger: { trigger: specs[0], start: "top 88%" } }
        );
      }

      // Horizontal gallery (Desktop only)
      if (animationConfig && animationConfig.viewportWidth >= 768) {
        const horizontalTrack = document.querySelector('.gallery-horizontal-track') as HTMLElement;
        const horizontalContainer = document.querySelector('.gallery-horizontal-container');
        
        if (horizontalTrack && horizontalContainer) {
          const items = Array.from(horizontalTrack.querySelectorAll('.gallery-horizontal-item')) as HTMLElement[];
          
          if (items.length > 0) {
            const gap = 40;
            const trackStyles = window.getComputedStyle(horizontalTrack);
            const paddingLeft = parseFloat(trackStyles.paddingLeft);
            const paddingRight = parseFloat(trackStyles.paddingRight);
            const firstItemWidth = items[0]?.offsetWidth || 0;
            const centerOffset = (animationConfig.viewportWidth - firstItemWidth) / 2 - paddingLeft;
            const totalWidth = items.reduce((sum, item) => sum + item.offsetWidth + gap, -gap);
            const scrollDistance = totalWidth + paddingLeft + paddingRight - animationConfig.viewportWidth + centerOffset;

            gsap.fromTo(
              horizontalTrack,
              { x: centerOffset },
              {
                x: -scrollDistance,
                ease: "none",
                scrollTrigger: {
                  trigger: horizontalContainer.parentElement,
                  start: "top top",
                  end: () => `+=${horizontalContainer.parentElement?.offsetHeight}`,
                  scrub: 1,
                  pin: horizontalContainer,
                  pinSpacing: true,
                  anticipatePin: 1,
                },
              }
            );
          }
        }
      }

      // Related cards
      const relatedCards = mainRef.current?.querySelectorAll(".related-card");
      if (relatedCards?.length) {
        gsap.fromTo(
          relatedCards,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: relatedCards[0].parentElement, start: "top 88%" } }
        );
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      animationsInitialized.current = false;
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [project, isClient, animationConfig]);

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-[#F5F7F5]" style={{ paddingTop: '140px' }}>
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#146321] mx-auto mb-4"></div>
            <p className="text-[#146321] font-semibold">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  // Process specs data properly
  const allDetails = Array.isArray(project.specs) 
    ? project.specs.map((spec: any) => [spec.key, spec.value])
    : [];
  const statsDetails = (project.heroStats || []).slice(0, 4);
  const teamDetails = allDetails.slice(4);
  const galleryItems = (project.gallery || []);
  const galleryImages = galleryItems
    .filter((item: any) => item.type === 'image')
    .map((item: any) => getS3ImageUrl(item.url) || item.url);
  const galleryVideos = galleryItems
    .filter((item: any) => item.type === 'video')
    .map((item: any) => ({ url: getS3ImageUrl(item.url) || item.url, id: item.id }));
  const allGalleryItems = galleryItems.map((item: any) => ({
    type: item.type,
    url: getS3ImageUrl(item.url) || item.url,
    id: item.id
  }));

  return (
    <div className="min-h-screen bg-[#F5F7F5]" ref={mainRef}>

      {/* HERO  */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100svh", minHeight: 650, maxHeight: 950 }}
      >
       
        <div className="absolute inset-0">
          <OptimizedImage
            ref={heroImgRef}
            src={getS3ImageUrl(project.heroUrl || project.bannerUrl) || '/placeholder.jpg'}
            alt={project.name}
            fill
            sizes="100vw"
            priority
            placeholder="blur"
            blurDataURL={getBlurDataURL()}
            className="object-cover"
            style={{ transformOrigin: "center top" }}
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(8,24,10,0.95) 0%, rgba(8,24,10,0.65) 28%, rgba(8,24,10,0.20) 55%, transparent 100%)",
          }}
        />

        
        <div className="absolute top-0 left-0 right-0 z-20 pt-8 md:pt-10">
          <div className={CONTAINER}>
            <button
              onClick={() => router.push("/projects")}
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

            {/* Project type */}
            <p
              className="hero-anim font-bold text-[#D4AF37] uppercase tracking-[0.28em]"
              style={{ fontSize: "10px", marginBottom: "clamp(18px, 2.5vh, 28px)" }}
            >
              [ {project.type} ]
            </p>

            {/* Title */}
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
              {project.name}
            </h1>

            
            <div
              className="hero-anim"
              style={{ width: "clamp(120px, 20vw, 280px)", height: "1.5px", backgroundColor: "#D4AF37", marginBottom: "clamp(20px, 3vh, 32px)" }}
            />

            {/* Stats row — inline with yellow labels */}
            {statsDetails.length > 0 && (
              <div className="hero-anim flex flex-row flex-wrap items-center gap-x-8 md:gap-x-12 lg:gap-x-16 gap-y-4">
                  {statsDetails.map((stat: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="text-[#D4AF37] font-bold uppercase tracking-[0.15em]"
                      style={{ fontSize: "9px" }}
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
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/*  OVERVIEW  */}
      <section style={{ backgroundColor: "#F5F1E8" }}>
        <div style={{ paddingTop: "clamp(80px, 10vh, 120px)", paddingBottom: "clamp(80px, 10vh, 120px)", paddingLeft: "clamp(40px, 6vw, 100px)", paddingRight: "clamp(40px, 6vw, 100px)" }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              <div className="lg:col-span-4 reveal-up">
                <p 
                  className="font-bold uppercase tracking-[0.25em] mb-6"
                  style={{ fontSize: "10px", color: "#D4AF37", letterSpacing: "0.25em" }}
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
                <p 
                  className="font-semibold mb-6"
                  style={{ 
                    fontSize: "clamp(1.15rem, 2vw, 1.35rem)", 
                    lineHeight: 1.6,
                    color: "#1a1a1a",
                    fontWeight: 600
                  }}
                >
                  {(project.overview as any)?.vision || project.address}
                </p>
                <div style={{ width: "80px", height: "3px", backgroundColor: "#D4AF37", marginBottom: "clamp(24px, 3vh, 32px)" }} />
                {(project.overview as any)?.sustainability && (
                  <p 
                    style={{ 
                      fontSize: "clamp(1rem, 1.5vw, 1.1rem)", 
                      lineHeight: 1.8,
                      color: "#666666",
                      fontWeight: 400
                    }}
                  >
                    {(project.overview as any).sustainability}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  SPECIFICATIONS  */}
      {allDetails.length > 0 && (
        <section style={{ backgroundColor: "#0d3d1a" }}>
          <div style={{ paddingTop: "clamp(100px, 12vh, 140px)", paddingBottom: "clamp(100px, 12vh, 140px)", paddingLeft: "clamp(40px, 6vw, 100px)", paddingRight: "clamp(40px, 6vw, 100px)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              
              {/* Header */}
              <div className="mb-20 reveal-up">
                <p 
                  className="font-bold uppercase mb-8"
                  style={{ fontSize: "10px", color: "#D4AF37", letterSpacing: "0.25em", marginBottom: "20px" }}
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
                    marginBottom : "40px"
                  }}
                >
                  Specifications
                </h2>
              </div>

              {/* Stats Cards - 4 in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                {statsDetails.map((stat: any, i: number) => (
                  <div
                    key={i}
                    className="spec-card"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "12px",
                      padding: "clamp(32px, 5vh, 48px) clamp(28px, 4vw, 40px)"
                    }}
                  >
                    <dt 
                      className="font-bold uppercase"
                      style={{ 
                        fontSize: "10px", 
                        color: "#D4AF37", 
                        letterSpacing: "0.15em",
                        marginBottom: "clamp(16px, 2vh, 24px)"
                      }}
                    >
                      {stat.key}
                    </dt>
                    <dd 
                      style={{ 
                        fontSize: "clamp(1.75rem, 3vw, 2.5rem)", 
                        lineHeight: 1.2,
                        color: "#ffffff",
                        fontWeight: 400
                      }}
                    >
                      <AnimatedNumber value={stat.value} />
                    </dd>
                  </div>
                ))}
              </div>

              
              {teamDetails.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8" >
                  {teamDetails.map((detail: any, i: number) => (
                    <div
                      key={i}
                      className="spec-card"
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "12px",
                        padding: "clamp(32px, 5vh, 48px) clamp(28px, 4vw, 40px)"
                      }}
                    >
                      <dt 
                        className="font-bold uppercase"
                        style={{ 
                          fontSize: "10px", 
                          color: "#D4AF37", 
                          letterSpacing: "0.15em",
                          marginBottom: "clamp(16px, 2vh, 24px)"
                        }}
                      >
                        {detail[0]}
                      </dt>
                      <dd 
                        style={{ 
                          fontSize: "clamp(1.15rem, 1.8vw, 1.5rem)", 
                          lineHeight: 1.4,
                          color: "#ffffff",
                          fontWeight: 400
                        }}
                      >
                        {detail[1]}
                      </dd>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/*  GALLERY  */}
      {allGalleryItems.length > 0 && (
        <section style={{ backgroundColor: "#F5F1E8" }} className="gallery-section">
          <div style={{ paddingTop: "clamp(80px, 10vh, 120px)", paddingBottom: "clamp(80px, 10vh, 120px)", paddingLeft: "clamp(16px, 6vw, 100px)", paddingRight: "clamp(16px, 6vw, 100px)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              
              {/* Header */}
              <div className="mb-16 reveal-up">
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

              {/* Mobile: Simple vertical stack, Desktop: Horizontal scroll */}
              {isMobile ? (
                // MOBILE: Simple vertical layout with lazy loading
                <div className="flex flex-col gap-6">
                  {allGalleryItems.map((item: any, index: number) => (
                    <GalleryItem
                      key={item.id || index}
                      item={item}
                      index={index}
                      projectName={project.name}
                      isMobile={true}
                      style={{
                        width: '100%',
                        aspectRatio: '3/4',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#000',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        position: 'relative',
                      }}
                    />
                  ))}
                </div>
              ) : (
                // DESKTOP: Horizontal scroll animation
                <div style={{ minHeight: `${(allGalleryItems.length + 1) * 100}vh` }}>
                  <div 
                    className="gallery-horizontal-container"
                    style={{
                      position: 'sticky',
                      top: 0,
                      height: '100vh',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <div 
                      className="gallery-horizontal-track"
                      style={{
                        display: 'flex',
                        gap: 'clamp(16px, 4vw, 40px)',
                        paddingLeft: 'clamp(16px, 6vw, 100px)',
                        paddingRight: 'clamp(16px, 6vw, 100px)',
                      }}
                    >
                      {allGalleryItems.map((item: any, index: number) => (
                        <GalleryItem
                          key={item.id || index}
                          item={item}
                          index={index}
                          projectName={project.name}
                          isMobile={false}
                          className="gallery-horizontal-item"
                          style={{
                            flexShrink: 0,
                            width: 'clamp(280px, 85vw, 1000px)',
                            height: 'clamp(350px, 50vh, 700px)',
                            borderRadius: 'clamp(12px, 2vw, 16px)',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                            position: 'relative',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/*  RELATED PROJECTS  */}
      {relatedProjects.length > 0 && (
        <section style={{ backgroundColor: "#0d1f0d" }}>
          <div style={{ paddingTop: "clamp(80px, 10vh, 120px)", paddingBottom: 0, paddingLeft: "clamp(40px, 6vw, 100px)", paddingRight: "clamp(40px, 6vw, 100px)" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16 reveal-up" style={{ marginBottom: "clamp(32px, 4vh, 64px)" }}>
                <div>
                  <p 
                    className="font-bold uppercase mb-6"
                    style={{ fontSize: "10px", color: "#D4AF37", letterSpacing: "0.25em" }}
                  >
                    [ RELATED WORKS ]
                  </p>
                  <h2
                    className="font-[family-name:var(--font-heading)]"
                    style={{ 
                      fontSize: "clamp(2.5rem, 4vw, 3.5rem)", 
                      lineHeight: 1.1,
                      fontWeight: 400,
                      color: "#ffffff",
                      letterSpacing: "-0.01em",
                      marginBottom: "clamp(50px, 3vh, 32px)"
                    }}
                  >
                    Related Projects
                  </h2>
                </div>
                <div className="sm:self-auto" style={{ marginTop: "-40px" }}>
                  <MagneticButton href="/projects" variant="gold">VIEW ALL WORKS</MagneticButton>
                </div>
              </div>
            </div>
          </div>
          
          {/* Continuous Scrolling Carousel */}
          <div className="relative" style={{ paddingBottom: "clamp(80px, 10vh, 120px)" }}>
            <div className="overflow-hidden">
              <div className="flex gap-6" style={{ width: 'max-content', animation: 'scroll-seamless 50s linear infinite' }}>
                {/* Triple the projects for seamless infinite loop */}
                {[...relatedProjects, ...relatedProjects, ...relatedProjects].map((rp, idx) => (
                  <article
                    key={`project-${idx}`}
                    className="related-card group cursor-pointer overflow-hidden transition-all duration-300 flex flex-col flex-shrink-0"
                    style={{
                      width: "380px",
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "12px"
                    }}
                    onClick={() => router.push(`/projects/${rp.id}`)}
                  >
                    <div className="relative w-full overflow-hidden" style={{ height: 280 }}>
                      <OptimizedImage
                        src={rp.image}
                        alt={rp.title}
                        fill
                        sizes="380px"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={getBlurDataURL()}
                        className="object-cover group-hover:scale-[1.07] transition-transform duration-500"
                      />
                      <span 
                        className="absolute top-4 left-4 text-white font-bold tracking-widest uppercase"
                        style={{
                          backgroundColor: "rgba(212, 175, 55, 0.9)",
                          fontSize: "9px",
                          padding: "6px 12px",
                          borderRadius: "4px"
                        }}
                      >
                        {rp.type}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-1 gap-3">
                      <h3 
                        className="font-bold font-[family-name:var(--font-heading)] group-hover:text-[#D4AF37] transition-colors duration-250 leading-snug"
                        style={{ fontSize: "1.35rem", color: "#ffffff" }}
                      >
                        {rp.title}
                      </h3>
                      <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        {rp.address}
                      </p>
                      <div 
                        className="flex items-center gap-1 font-bold tracking-widest uppercase mt-2 group-hover:gap-2 transition-all duration-250"
                        style={{ color: "#D4AF37", fontSize: "10px" }}
                      >
                        VIEW PROJECT <ArrowUpRight size={15} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HAVE A VISION */}
      <section style={{ backgroundColor: "#F5F1E8" }}>
        <div style={{ paddingTop: "clamp(100px, 15vh, 160px)", paddingBottom: "clamp(100px, 15vh, 160px)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", paddingLeft: "clamp(24px, 5vw, 60px)", paddingRight: "clamp(24px, 5vw, 60px)" }}>
            <div className="reveal-up">
              {/* Label */}
              <p 
                className="font-bold uppercase mb-10"
                style={{ 
                  fontSize: "10px", 
                  color: "#D4AF37", 
                  letterSpacing: "0.3em",
                  marginBottom: "clamp(40px, 6vh, 60px)"
                }}
              >
                [ LET'S BUILD TOGETHER ]
              </p>
              
              {/* Heading */}
              <h2
                className="font-[family-name:var(--font-heading)] mb-12"
                style={{ 
                  fontSize: "clamp(3rem, 6vw, 5rem)", 
                  lineHeight: 1.1,
                  fontWeight: 400,
                  color: "#0d1f0d",
                  letterSpacing: "-0.01em",
                  marginBottom: "clamp(40px, 6vh, 60px)"
                }}
              >
                Have a Vision?
              </h2>
              
              {/* Description */}
              <p 
                style={{ 
                  fontSize: "clamp(1.1rem, 2vw, 1.35rem)", 
                  lineHeight: 1.7,
                  color: "#0d1f0d",
                  maxWidth: "900px",
                  margin: "0 auto",
                  marginBottom: "clamp(70px, 8vh, 80px)",
                  textAlign: "center"
                }}
              >
                Our team blends advanced construction technology with decade-spanning expertise to bring complex architectural visions to life. Let's discuss your next landmark.
              </p>
              
              {/* CTA Button */}
              <div className="flex justify-center">
                <MagneticButton 
                  href="/contact" 
                  variant="primary"
                  style={{
                    padding: "18px 48px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase"
                  }}
                >
                  <span>INQUIRE ABOUT A PROJECT</span>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}