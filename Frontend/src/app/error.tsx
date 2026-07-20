'use client';

import { useEffect } from 'react';
import MagneticButton from '@/components/MagneticButton';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
    
    // Auto-retry once after a short delay
    const timer = setTimeout(() => {
      reset();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [error, reset]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF8]">
      <div className="text-center px-6 max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#146321] mx-auto"></div>
        <p className="text-[#475569] mt-4">Loading...</p>
      </div>
    </div>
  );
}
