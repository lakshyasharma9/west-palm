"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { LOADER_CONFIG } from "@/constants/loader";
import Image from "next/image";

interface ConstructionLoaderProps {
  onComplete?: () => void;
}

export default function ConstructionLoader({ onComplete }: ConstructionLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    gsap.set(logo, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlayRef.current, {
          yPercent: -100, duration: 1.2, ease: "power3.inOut",
          onComplete: () => {
            setVisible(false);
            if (onComplete) onComplete();
          },
        });
      },
    });

    // 3 blinks = 5 transitions
    tl.to(logo, { opacity: 1, duration: 0.6, ease: "sine.inOut" })
      .to(logo, { opacity: 0.2, duration: 0.6, ease: "sine.inOut" })
      .to(logo, { opacity: 1, duration: 0.6, ease: "sine.inOut" })
      .to(logo, { opacity: 0.2, duration: 0.6, ease: "sine.inOut" })
      .to(logo, { opacity: 1, duration: 0.6, ease: "sine.inOut" })
      .to({}, { duration: 0.4 });
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        backgroundColor: LOADER_CONFIG.BACKGROUND_COLOR,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div ref={logoRef} style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Image
          src="/logo-white.png"
          alt="WPCS Logo"
          width={200}
          height={200}
          priority
        />
      </div>
    </div>
  );
}
