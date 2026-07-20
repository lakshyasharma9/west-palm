"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import { getProjects, getS3ImageUrl } from "@/lib/api";
import OptimizedImage from "@/components/OptimizedImage";
import { getBlurDataURL } from "@/lib/image-utils";

interface Project {
  id: string;
  name: string;
  bannerUrl: string;
  address: string;
  type: string;
}

function ProjectsContent() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjects();
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center" style={{ paddingTop: 'clamp(140px, 18vh, 180px)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#146321] mx-auto mb-4"></div>
          <p className="text-[#146321] font-semibold">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8]" style={{ paddingTop: 'clamp(140px, 18vh, 180px)', paddingBottom: 0 }}>
      <section style={{ paddingLeft: 'clamp(40px, 8vw, 120px)', paddingRight: 'clamp(40px, 8vw, 120px)', marginBottom: 'clamp(80px, 12vh, 120px)' }}>
        <div>
          <div className="max-w-7xl" style={{ marginBottom: 'clamp(56px, 9vh, 80px)' }}>
            <span className="inline-block text-xs font-bold text-[#146321] tracking-[0.18em] uppercase mb-4">
              [ Work ]
            </span>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-[family-name:var(--font-heading)]"
              style={{ lineHeight: 1.1, letterSpacing: "-0.02em" }}
            >
              Building Excellence Through <span className="text-[#146321]">Every Project</span>
            </h1>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No projects found. Add projects from the admin panel.</p>
            </div>
          ) : (
            <div
              className="grid md:grid-cols-2"
              style={{ gap: 'clamp(32px, 4vw, 48px)' }}
            >
              {projects.map((project, index) => {
                const imageUrl = getS3ImageUrl(project.bannerUrl) || '/projects/aventana.jpeg';
                // Progressive loading: First 4 images load eagerly (above fold), rest lazy
                const isAboveFold = index < 4;
                
                return (
                  <div
                    key={project.id}
                    className="group cursor-pointer bg-white"
                    style={{
                      borderRadius: '12px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden'
                    }}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      router.push(`/projects/${project.id}`);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.05)';
                    }}
                  >
                    {/* Image Section with Hover Effect */}
                    <div 
                      style={{ padding: '12px', position: 'relative' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.scrollTo(0, 0);
                        router.push(`/projects/${project.id}`);
                      }}
                    >
                      <div className="relative w-full h-[380px] md:h-[420px] overflow-hidden" style={{ borderRadius: '8px' }}>
                        <OptimizedImage
                          src={imageUrl}
                          alt={project.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={isAboveFold}
                          loading={isAboveFold ? 'eager' : 'lazy'}
                          placeholder="blur"
                          blurDataURL={getBlurDataURL()}
                          className="object-cover group-hover:scale-105 group-hover:blur-[2px] transition-all duration-300"
                        />
                        
                        {/* Overlay Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                          <MagneticButton
                            onClick={() => router.push(`/projects/${project.id}`)}
                            variant="gold"
                            className="!px-8 !py-4 !flex !flex-row !items-center !gap-3 !relative !z-20"
                          >
                            <span>View Project</span>
                            <ArrowUpRight size={20} strokeWidth={2.5} />
                          </MagneticButton>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div style={{ padding: '16px' }}>
                      {/* Project Title */}
                      <h3 
                        className="font-bold font-[family-name:var(--font-heading)]"
                        style={{
                          fontSize: 'clamp(24px, 3vw, 28px)',
                          fontWeight: '700',
                          color: '#146321',
                          marginBottom: '16px',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {project.name}
                      </h3>

                      {/* Project Address */}
                      <div style={{ marginBottom: '16px' }}>
                        <p 
                          className="font-bold uppercase"
                          style={{
                            fontSize: '12px',
                            color: '#94A3B8',
                            letterSpacing: '0.05em',
                            marginBottom: '8px'
                          }}
                        >
                          Project Address
                        </p>
                        <p 
                          className="font-medium"
                          style={{
                            fontSize: '14px',
                            color: '#1E293B',
                            lineHeight: '1.6'
                          }}
                        >
                          {project.address}
                        </p>
                      </div>

                      {/* Project Type */}
                      <div>
                        <p 
                          className="font-bold uppercase"
                          style={{
                            fontSize: '12px',
                            color: '#94A3B8',
                            letterSpacing: '0.05em',
                            marginBottom: '8px'
                          }}
                        >
                          Project Type
                        </p>
                        <p 
                          className="font-medium"
                          style={{
                            fontSize: '14px',
                            color: '#1E293B',
                            lineHeight: '1.6'
                          }}
                        >
                          {project.type}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="relative w-full h-screen overflow-hidden" style={{ marginTop: 0 }}>
      
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url("/services/const.jpg")',
                  backgroundAttachment: 'fixed',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              >
                <div className="absolute inset-0 bg-black/50" />
              </div>
      
      
              <div className="relative z-10 h-full flex items-center">
                <div className="section-container w-full">
                  <div className="max-w-3xl">
                    <span className="inline-block text-sm font-semibold text-[#D4AF37] tracking-widest uppercase mb-6">
                      [Get in Touch]
                    </span>
                    
                    <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1]" style={{ color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)' }}>
                      Ready to Get{" "}
                      <span className="font-serif italic" style={{ fontFamily: "Georgia, serif", color: '#ffffff' }}>
                        Started
                      </span>
                    </h2>
                    
                    <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl" style={{ marginBottom: '40px' }}>
                      Let our expert team handle the hard work while you enjoy a beautiful project. Get in touch today for a free quote!
                    </p>
      
                    <MagneticButton
                      href="/contact"
                      variant="primary"
                      className="group/btn !bg-white hover:!bg-[#146321] transition-all duration-500 ease-in-out !border !border-[#146321]/10 !py-3 !px-3 !pl-8 inline-flex flex-row items-center gap-3 shadow-sm hover:shadow-[0_8px_30px_rgba(20,99,33,0.3)] !rounded-full"
                      style={{ display: 'inline-flex', alignItems: 'center', flexDirection: 'row' }}
                    >
                      <span className="font-semibold text-[#1E293B] group-hover/btn:text-white transition-all duration-500 ease-in-out text-[1.1rem]" style={{ whiteSpace: 'nowrap', lineHeight: '1' }}>
                        Contact Us
                      </span>
                      <span className="shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out bg-[#146321] group-hover/btn:bg-white" style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px' }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white group-hover/btn:text-[#146321] transition-all duration-500 ease-in-out group-hover/btn:rotate-45"
                        >
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </span>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </section>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsContent />
    </Suspense>
  );
}
