"use client";

/**
 * NewsletterStickyFix — Definitive Lenis + sticky fix
 *
 * Lenis v1 sets `html { overflow: clip }` which breaks position:sticky.
 * Strategy: destroy Lenis, clear ALL overflow on html/body, force native scroll.
 * Uses a MutationObserver to re-apply the fix if Lenis re-injects its style tag.
 */

import { useEffect } from "react";

function applyNativeScroll() {
  const html = document.documentElement;
  const body = document.body;

  // Kill Lenis
  const lenis = (window as any).lenis;
  if (lenis) {
    try { lenis.stop?.(); } catch {}
    try { lenis.destroy?.(); } catch {}
    (window as any).lenis = null;
  }

  // Force native scroll — use setProperty with !important to beat any stylesheet
  html.style.setProperty("overflow",   "auto",    "important");
  html.style.setProperty("overflow-x", "hidden",  "important");
  html.style.setProperty("overflow-y", "auto",    "important");
  body.style.setProperty("overflow",   "visible", "important");
  body.style.setProperty("overflow-x", "hidden",  "important");
  body.style.setProperty("overflow-y", "visible", "important");
}

export default function NewsletterStickyFix() {
  useEffect(() => {
    // Apply immediately
    applyNativeScroll();

    // Watch for Lenis re-injecting its style tag and re-apply
    const observer = new MutationObserver(() => {
      const html = document.documentElement;
      const computed = window.getComputedStyle(html).overflow;
      // If overflow got set back to clip/hidden, re-apply our fix
      if (computed === "clip" || computed === "hidden") {
        applyNativeScroll();
      }
    });

    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

    // Also re-apply after a short delay (catches async Lenis init)
    const t1 = setTimeout(applyNativeScroll, 50);
    const t2 = setTimeout(applyNativeScroll, 200);
    const t3 = setTimeout(applyNativeScroll, 500);

    return () => {
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      // Clear inline overrides on unmount
      const html = document.documentElement;
      const body = document.body;
      html.style.removeProperty("overflow");
      html.style.removeProperty("overflow-x");
      html.style.removeProperty("overflow-y");
      body.style.removeProperty("overflow");
      body.style.removeProperty("overflow-x");
      body.style.removeProperty("overflow-y");
    };
  }, []);

  return null;
}
