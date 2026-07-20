"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Pages that need native scroll (position:sticky requires it).
 * Lenis intercepts scroll and sets overflow:hidden on <html>, which
 * completely breaks CSS sticky positioning.
 */
const NATIVE_SCROLL_PATHS = ["/newsletter"];

function isNativeScrollPage(pathname: string): boolean {
  return NATIVE_SCROLL_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
}

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip Lenis entirely on newsletter pages — they need native scroll
    // for position:sticky to work on the sidebar.
    if (isNativeScrollPage(pathname)) {
      // Destroy any existing Lenis instance
      const existing = (window as any).lenis;
      if (existing) {
        try { existing.stop?.(); } catch {}
        try { existing.destroy?.(); } catch {}
        (window as any).lenis = null;
      }
      // Force native scroll immediately
      document.documentElement.style.setProperty("overflow",   "auto",    "important");
      document.documentElement.style.setProperty("overflow-y", "auto",    "important");
      document.body.style.setProperty("overflow",   "visible", "important");
      document.body.style.setProperty("overflow-y", "visible", "important");
      return;
    }

    // Initialize Lenis for all other pages
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 0,
    });

    // Expose Lenis instance globally for ScrollManager
    (window as any).lenis = lenis;

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const rafFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      (window as any).lenis = null;
      gsap.ticker.remove(rafFn);
    };
  }, [pathname]);

  return null;
}
