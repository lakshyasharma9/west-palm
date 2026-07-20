"use client";

import { useEffect, useRef, useState } from 'react';
import OptimizedImage from './OptimizedImage';
import LazyVideoPlayer from './LazyVideoPlayer';
import { getBlurDataURL } from '@/lib/image-utils';

interface GalleryItemProps {
  item: {
    type: 'image' | 'video';
    url: string;
    id: string;
  };
  index: number;
  projectName: string;
  isMobile?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function GalleryItem({ 
  item, 
  index, 
  projectName, 
  isMobile = false,
  style,
  className 
}: GalleryItemProps) {
  const [shouldRender, setShouldRender] = useState(index < 3); // First 3 render immediately
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
    >
      {shouldRender ? (
        item.type === 'image' ? (
          <OptimizedImage
            src={item.url}
            alt={`${projectName} — view ${index + 1}`}
            fill
            sizes={isMobile ? '100vw' : '70vw'}
            loading={index < 3 ? 'eager' : 'lazy'}
            priority={index < 3}
            placeholder="blur"
            blurDataURL={getBlurDataURL()}
            className={isMobile ? 'object-cover' : 'object-contain'}
          />
        ) : (
          <LazyVideoPlayer videoUrl={item.url} index={index} />
        )
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
        </div>
      )}
    </div>
  );
}
