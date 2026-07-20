"use client";

import { useRef } from "react";
import Link from "next/link";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "outline" | "gold";
  style?: React.CSSProperties;
}

export default function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
  style,
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  };

  const reset = () => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.style.transform = "translate(0px, 0px)";
    btn.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    // btn.style.transition = 'none'; // this causes a flicker bug, keep bezier
    setTimeout(() => {
      if (btn) btn.style.transition = "";
    }, 500);
  };

  const baseClass =
    variant === "primary"
      ? "magnetic-btn"
      : variant === "outline"
      ? "magnetic-btn !bg-transparent border-2 !border-[#146321] !text-[#146321] hover:!text-white"
      : "magnetic-btn !bg-[#D4AF37] !text-[#0d1f0d] hover:!bg-[#146321] hover:!text-[#D4AF37] hover:!shadow-[0_0_20px_rgba(212,175,55,0.5)]";

  const content = (
    <div
      ref={btnRef}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="inline-block"
    >
      {href ? (
        <Link href={href} className={`${baseClass} ${className}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', ...style }}>
          <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
        </Link>
      ) : (
        <button onClick={onClick} className={`${baseClass} ${className}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', ...style }}>
          <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
        </button>
      )}
    </div>
  );

  return content;
}
