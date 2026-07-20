"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import ConstructionLoader from "./ConstructionLoader";

export default function NavigationLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const prevPathRef = useRef<string>(pathname);

  useEffect(() => {
    // Force scroll to top on every route change
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Skip loading for project detail pages
    if (pathname.startsWith('/projects/') && pathname !== '/projects') {
      prevPathRef.current = pathname;
      return;
    }

    // Skip loading for newsletter pages — they have their own skeleton
    if (pathname.startsWith('/newsletter')) {
      prevPathRef.current = pathname;
      return;
    }

    if (pathname !== prevPathRef.current) {
      setLoading(true);
      prevPathRef.current = pathname;
      document.body.style.overflow = 'hidden';
    }
  }, [pathname]);

  const handleComplete = () => {
    setLoading(false);
    document.body.style.overflow = '';
    // Ensure scroll to top after loading completes
    window.scrollTo(0, 0);
  };

  if (!loading) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
    }}>
      <ConstructionLoader onComplete={handleComplete} />
    </div>
  );
}
