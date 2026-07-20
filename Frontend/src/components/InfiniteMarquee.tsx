"use client";

import { useEffect, useRef, useState } from "react";
import { techItems } from "@/constants/technologies";

export default function InfiniteMarquee() {
  const [fillWidth, setFillWidth] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        rafRef.current = requestAnimationFrame(() => {
          const section = sectionRef.current;
          if (!section) return;

          const rect = section.getBoundingClientRect();
          const windowH = window.innerHeight;
          const exitProgress = Math.max(0, Math.min(1, -rect.top / rect.height));

          if (exitProgress > 0) {
            setFillWidth((1 - exitProgress) * 100);
          } else {
            const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height)));
            setFillWidth(Math.min(progress * 3, 1) * 100);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="overflow-hidden py-10 border-y border-[rgba(20,99,33,0.1)]"
      style={{ position: "relative", background: "#D4AF37" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: `${fillWidth}%`,
          backgroundColor: "rgba(10, 59, 18, 0.95)",
          transition: "width 0.1s linear",
          zIndex: 0,
        }}
      />

      <div 
        className="marquee-track flex items-center gap-16" 
        style={{ 
          position: "relative", 
          zIndex: 1,
          animation: 'marquee-scroll 40s linear infinite',
          width: 'max-content'
        }}
      >
        {[...techItems, ...techItems].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-white hover:text-white transition-colors duration-500 group shrink-0"
          >
            <item.Icon
              size={28}
              className="opacity-40 group-hover:opacity-100 transition-opacity duration-500"
            />
            <span className="text-lg font-semibold tracking-wide whitespace-nowrap font-[family-name:var(--font-heading)]">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
