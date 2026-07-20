"use client";

import { memo, useRef, useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import type { Service } from "@/types";
import { getBlurDataURL } from "@/lib/image-utils";

interface ServiceCardProps extends Service {
  index?: number;
}

const ServiceCard = memo(function ServiceCard({
  title,
  description,
  image,
  href = "/services",
  index = 0,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef<number>(undefined);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      setTransform(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      );
      
      rafRef.current = undefined;
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    setTransform("");
    setHovered(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }, []);

  const onMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      className="rounded-2xl"
      style={{
        transform,
        transition: transform ? "none" : "transform 0.5s ease",
        transformStyle: "preserve-3d",
        border: hovered ? "2px solid rgba(20,99,33,0.8)" : "2px solid rgba(20,99,33,0.3)",
        overflow: "hidden",
        position: "relative",
        minHeight: "320px",
        cursor: "pointer",
      }}
    >
      {/* Background Image */}
      {image && (
        <OptimizedImage
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          priority={index < 3}  // First 3 services load with priority
          loading={index < 3 ? 'eager' : 'lazy'}
          className="object-contain"
          placeholder="blur"
          blurDataURL={getBlurDataURL()}
          style={{
            transition: "filter 0.4s ease, transform 0.4s ease",
            filter: hovered ? "brightness(0.35) blur(2px)" : "brightness(1)",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            backgroundColor: "#f8f9fa",
          }}
        />
      )}

      {/* Always visible: heading at bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "28px",
          background: hovered
            ? "transparent"
            : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
          transition: "background 0.4s ease",
        }}
      >
        <h3
          style={{
            fontSize: "clamp(1.1rem, 1.5vw, 1.3rem)",
            lineHeight: 1.25,
            margin: 0,
            color: "#ffffff",
            fontWeight: 700,
            opacity: hovered ? 0 : 1,
            transform: hovered ? "translateY(8px)" : "translateY(0)",
            textShadow: "0 2px 12px rgba(0,0,0,1)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {title}
        </h3>
      </div>

      {/* Hover overlay: description + button */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "28px",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <h3
          style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.3rem)", lineHeight: 1.25, marginBottom: "12px", color: "#ffffff", fontWeight: 700 }}
        >
          {title}
        </h3>
        <p
          style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "rgba(255,255,255,0.85)", marginBottom: "24px" }}
        >
          {description}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider hover:gap-4 transition-all duration-300"
        >
          Explore Service <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
});

export default ServiceCard;
