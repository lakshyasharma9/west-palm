"use client";

import { useEffect, useState, useRef } from 'react';

export default function LaptopMockup() {
  const [isVisible, setIsVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      requestAnimationFrame(() => {
        videoRef.current?.play().catch(err => console.log('Video autoplay prevented:', err));
      });
    }
  };

  // Parallax effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Normalize to -1 to 1 range
    const normalizedX = (x - 0.5) * 2;
    const normalizedY = (y - 0.5) * 2;
    
    setMousePosition({ x: normalizedX, y: normalizedY });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Calculate parallax transform
  const parallaxRotateY = mousePosition.x * 8; // Max 8deg rotation
  const parallaxRotateX = -mousePosition.y * 8; // Max 8deg rotation
  const parallaxTranslateX = mousePosition.x * 10; // Max 10px movement
  const parallaxTranslateY = mousePosition.y * 10; // Max 10px movement

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full min-h-[280px] sm:min-h-[420px] lg:min-h-[520px] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient Glow Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-emerald-200/20 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Monitor Container with 3D Transform + Parallax */}
      <div
        className="relative z-10 transition-all duration-300 ease-out w-full flex items-center justify-center"
        style={{
          perspective: '1400px',
          transformStyle: 'preserve-3d',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative animate-float"
          style={{
            transformStyle: 'preserve-3d',
            transform: `scale(${isHovered ? 1.02 : 1})`,
          }}
        >
          {/* Monitor Frame */}
          <div className="relative">
            {/* Screen Bezel with ultra-thin bezels + premium border */}
            <div className="relative w-[85vw] sm:w-[400px] lg:w-[480px] aspect-[16/10] bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#0a0a0a] rounded-t-[10px] shadow-[0_40px_120px_rgba(0,0,0,0.25)] border-2 border-[#2a2a2a]/50 overflow-hidden">
              {/* Inner border highlight */}
              <div className="absolute inset-0 rounded-t-[10px] border border-white/5 pointer-events-none" />
              
              {/* Outer glow */}
              <div className="absolute -inset-[1px] rounded-t-[10px] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-30 pointer-events-none" />
              
              {/* Screen Content */}
              <div className="absolute inset-[6px] top-[6px] bottom-0 left-[6px] right-[6px] bg-[#0a0f1a] rounded-t-[6px] overflow-hidden ring-1 ring-white/5">
                {isVisible ? (
                  <>
                    {!videoLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 z-10">
                        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        <p className="mt-4 text-xs text-slate-500 font-medium">Loading...</p>
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      onLoadedData={handleVideoLoad}
                      className="w-full h-full object-cover"
                      style={{
                        opacity: videoLoaded ? 1 : 0,
                        transition: 'opacity 0.6s ease'
                      }}
                    >
                      <source src="/videos/Media1.mp4" type="video/mp4" />
                    </video>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950">
                    <div className="text-5xl mb-4 opacity-40">🖥️</div>
                    <p className="text-xs text-slate-500 font-semibold tracking-wider">BIM DASHBOARD</p>
                  </div>
                )}
                
                {/* Glass Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
              </div>

              {/* 3D Side Edge Effect - Enhanced (hidden on mobile) */}
              <div className="absolute top-0 -right-2 w-2 h-full bg-gradient-to-r from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a] shadow-lg hidden sm:block" style={{ clipPath: 'polygon(0 0, 100% 2%, 100% 100%, 0 100%)' }} />
              
              {/* 3D Top Edge Effect - Enhanced (hidden on mobile) */}
              <div className="absolute -top-1.5 left-0 right-0 h-1.5 bg-gradient-to-b from-[#3a3a3a] via-[#2f2f2f] to-[#2a2a2a] rounded-t-[10px] shadow-md hidden sm:block" />
              
              {/* Bottom edge highlight */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Bottom Chin - Enhanced */}
            <div className="relative w-[85vw] sm:w-[400px] lg:w-[480px] h-8 bg-gradient-to-b from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a] rounded-b-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border-x-2 border-b-2 border-[#2a2a2a]/50 overflow-hidden">
              {/* Inner border highlight */}
              <div className="absolute inset-0 rounded-b-[10px] border border-white/5 pointer-events-none" />
              
              {/* Top edge highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/10 tracking-widest">WP</span>
              </div>
            </div>

            {/* Stand Neck - Enhanced (hidden on mobile) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-14 h-12 bg-gradient-to-r from-[#3a3a3a] via-[#2a2a2a] to-[#3a3a3a] shadow-lg border-x border-white/5 hidden sm:block">
              <div className="absolute left-0.5 top-0 w-0.5 h-full bg-gradient-to-b from-white/10 to-transparent" />
              <div className="absolute right-0.5 top-0 w-0.5 h-full bg-gradient-to-b from-black/30 to-transparent" />
            </div>

            {/* Stand Base - Enhanced (hidden on mobile) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+3rem)] w-52 h-14 flex-col hidden sm:flex">
              {/* Base Front */}
              <div className="w-full h-4 bg-gradient-to-b from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a] rounded-t shadow-lg relative border-t border-white/5">
                <div className="absolute top-0.5 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-black/30" />
              </div>
              {/* Base Top */}
              <div className="w-full h-10 bg-gradient-to-br from-[#3a3a3a] via-[#2a2a2a] to-[#1a1a1a] rounded-b-lg shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative border-x border-b border-white/5">
                <div className="absolute top-1 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded" />
                <div className="absolute inset-0 rounded-b-lg bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Ground Shadow (hidden on mobile) */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-80 h-8 bg-gradient-radial from-black/20 via-black/10 to-transparent rounded-full blur-xl hidden sm:block" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .animate-float {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
