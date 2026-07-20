"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { milestones } from "@/constants/timeline";

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end end"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div ref={containerRef} style={{ position: "relative", maxWidth: "720px", margin: "0 auto", padding: "0 16px" }}>

      {/* Vertical line — center on all screens */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: 0, bottom: 0, width: "2px",
        background: "rgba(20,99,33,0.12)",
        transform: "translateX(-50%)",
      }}/>
      <motion.div style={{
        position: "absolute",
        left: "50%",
        top: 0, bottom: 0, width: "2px",
        background: "#146321",
        transformOrigin: "top",
        transform: "translateX(-50%)",
        scaleY, zIndex: 10,
      }}/>

      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(32px, 5vh, 48px)", paddingTop: "8px", paddingBottom: "8px" }}>
        {milestones.map((item, i) => (
          <div key={i} style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>

            {/* Dot — center on all screens */}
            <div style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: "18px",
              width: "14px", height: "14px",
              borderRadius: "50%",
              background: "#146321",
              border: "3px solid #F8FAF8",
              boxShadow: "0 0 0 3px rgba(20,99,33,0.2)",
              zIndex: 20,
              flexShrink: 0,
            }}/>

            {/* Card — alternating on desktop, centered on mobile */}
            <div className={`w-full flex ${i % 2 === 0 ? "md:justify-start" : "md:justify-end"} justify-center`}>
              {/* Mobile: centered cards */}
              <div className="md:hidden w-full max-w-sm">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="glass rounded-2xl"
                  style={{ padding: "clamp(18px, 4vw, 24px) clamp(20px, 5vw, 28px)" }}
                >
                  <span className="font-bold text-[#D4AF37] font-[family-name:var(--font-heading)]"
                    style={{ fontSize: "clamp(1.1rem, 3vw, 1.3rem)", display: "block", marginBottom: "6px" }}>
                    {item.year}
                  </span>
                  <h3 className="font-bold text-[#1E293B]" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1rem)", marginBottom: "8px" }}>{item.title}</h3>
                  <p className="text-[#475569]" style={{ fontSize: "clamp(0.8rem, 2vw, 0.875rem)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </motion.div>
              </div>

              {/* Desktop: alternating sides */}
              <div className="hidden md:block" style={{ width: "calc(50% - 28px)" }}>
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                  className="glass rounded-2xl"
                  style={{ padding: "22px 26px" }}
                >
                  <span className="font-bold text-[#D4AF37] font-[family-name:var(--font-heading)]"
                    style={{ fontSize: "1.4rem", display: "block", marginBottom: "6px" }}>
                    {item.year}
                  </span>
                  <h3 className="font-bold text-[#1E293B]" style={{ fontSize: "0.95rem", marginBottom: "8px" }}>{item.title}</h3>
                  <p className="text-[#475569]" style={{ fontSize: "0.85rem", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </motion.div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
