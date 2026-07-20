"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface LoadingContextType {
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType>({ isLoading: false });

export function LoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPath, setPrevPath] = useState<string | null>(null);

  useEffect(() => {
    if (prevPath === null) {
      setPrevPath(pathname);
      return;
    }

    if (pathname !== prevPath) {
      setIsLoading(true);
      setPrevPath(pathname);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 4800);

      return () => clearTimeout(timer);
    }
  }, [pathname, prevPath]);

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
