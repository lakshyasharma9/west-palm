"use client";

import { useEffect, useRef, useState } from 'react';

interface LazyVideoPlayerProps {
  videoUrl: string;
  index: number;
  poster?: string;
}

export default function LazyVideoPlayer({ videoUrl, index, poster }: LazyVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      timeoutRef.current = setTimeout(() => setShowControls(false), 2000);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowControls(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isPlaying) {
      timeoutRef.current = setTimeout(() => setShowControls(false), 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {shouldLoad ? (
        <video
          ref={videoRef}
          src={videoUrl}
          preload="none"
          poster={poster}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'pointer',
          }}
          onClick={togglePlay}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>Loading video...</div>
        </div>
      )}
      
      <button
        onClick={togglePlay}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(212, 175, 55, 0.9)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 1)';
          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.9)';
          e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
        }}
      >
        {isPlaying ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#0d1f0d" stroke="none">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#0d1f0d" stroke="none">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>
    </div>
  );
}
