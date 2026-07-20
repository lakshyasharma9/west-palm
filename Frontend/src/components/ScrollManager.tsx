"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable browser scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Scroll to top on route change - compatible with Lenis
    const scrollToTop = () => {
      // Check if Lenis is available
      const lenisInstance = (window as any).lenis;
      
      if (lenisInstance && typeof lenisInstance.scrollTo === 'function') {
        // Use Lenis scrollTo for smooth scroll to top
        lenisInstance.scrollTo(0, { immediate: true });
      } else {
        // Fallback to native scroll
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    // Small delay to ensure Lenis is initialized
    const timer = setTimeout(scrollToTop, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
