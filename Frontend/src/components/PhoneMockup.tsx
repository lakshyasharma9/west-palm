"use client";

import { useEffect, useState, useRef } from 'react';

export default function PhoneMockup() {
  const [isVisible, setIsVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay rendering slightly to prioritize other content
          setTimeout(() => {
            setShouldRender(true);
            setIsVisible(true);
          }, 300);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Handle video load with error handling
  const handleVideoLoad = () => {
    setVideoLoaded(true);
    if (videoRef.current) {
      // Use requestAnimationFrame for smooth playback start
      requestAnimationFrame(() => {
        videoRef.current?.play().catch(err => {
          console.log('Video autoplay prevented:', err);
          // Fallback: show static placeholder
        });
      });
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoLoaded(false);
  };

  return (
    <div className="phone-mockup-container" ref={containerRef}>
      {shouldRender ? (
        <>
          {/* Drop Shadow */}
          <div className="phone-shadow" />

          {/* Phone Frame */}
          <div className="phone-frame">
            {/* Side Buttons */}
            <div className="phone-button-power" />
            <div className="phone-button-volume-up" />
            <div className="phone-button-volume-down" />

            {/* Notch */}
            <div className="phone-notch">
              <div className="phone-camera" />
            </div>

            {/* Screen Content */}
            <div className="phone-screen">
              {/* Glass Reflection Overlay */}
              <div className="phone-glass" />

              {/* Video Content - Only load when visible */}
              {isVisible ? (
                <>
                  {!videoLoaded && (
                    <div className="video-loading">
                      <div className="loading-spinner" />
                      <div className="loading-text">Loading...</div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 400'%3E%3Crect fill='%230a0f1a' width='200' height='400'/%3E%3C/svg%3E"
                    onLoadedData={handleVideoLoad}
                    onError={handleVideoError}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '32px',
                      position: 'relative',
                      zIndex: 1,
                      opacity: videoLoaded ? 1 : 0,
                      transition: 'opacity 0.5s ease',
                      willChange: 'opacity',
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <source src="/videos/Media1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </>
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📱</div>
                    <div className="placeholder-text">BIM Dashboard</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="phone-skeleton">
          <div className="skeleton-frame">
            <div className="skeleton-screen" />
          </div>
        </div>
      )}

      <style jsx>{`
        /* Phone Skeleton (Ultra-light placeholder) */
        .phone-skeleton {
          position: relative;
          width: 220px;
          height: 440px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .skeleton-frame {
          width: 220px;
          height: 440px;
          background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
          border-radius: 40px;
          border: 2px solid #d0d0d0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: skeleton-pulse 1.5s ease-in-out infinite;
        }

        .skeleton-screen {
          width: calc(100% - 24px);
          height: calc(100% - 24px);
          background: #c0c0c0;
          border-radius: 32px;
        }

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Container */
        .phone-mockup-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          min-height: 500px;
        }

        /* Drop Shadow */
        .phone-shadow {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: 30px;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.15), transparent 70%);
          border-radius: 50%;
          animation: shadow-pulse 4s ease-in-out infinite;
          z-index: 0;
        }

        /* Phone Frame */
        .phone-frame {
          position: relative;
          width: 220px;
          height: 440px;
          background: #111111;
          border-radius: 40px;
          border: 2px solid #2a2a2a;
          outline: 7px solid #0a0a0a;
          outline-offset: -1px;
          animation: float 4s ease-in-out infinite;
          transition: transform 0.3s ease;
          z-index: 1;
        }

        .phone-frame:hover {
          animation: none;
          transform: perspective(1000px) rotateY(-8deg) rotateX(2deg);
        }

        /* Side Buttons */
        .phone-button-power {
          position: absolute;
          right: -6px;
          top: 100px;
          width: 4px;
          height: 40px;
          background: #222;
          border-radius: 3px;
        }

        .phone-button-volume-up {
          position: absolute;
          left: -6px;
          top: 90px;
          width: 4px;
          height: 28px;
          background: #222;
          border-radius: 3px;
        }

        .phone-button-volume-down {
          position: absolute;
          left: -6px;
          top: 130px;
          width: 4px;
          height: 28px;
          background: #222;
          border-radius: 3px;
        }

        /* Notch */
        .phone-notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 24px;
          background: #0a0a0a;
          border-radius: 0 0 16px 16px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .phone-camera {
          width: 8px;
          height: 8px;
          background: #1a3a5c;
          border-radius: 50%;
        }

        /* Screen */
        .phone-screen {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          bottom: 12px;
          background: #0a0f1a;
          border-radius: 32px;
          overflow: hidden;
        }

        /* Glass Reflection */
        .phone-glass {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 45%, rgba(0,0,0,0.1) 100%);
          border-radius: 32px;
          pointer-events: none;
          z-index: 5;
        }

        .loading-text {
          margin-top: 12px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 9px;
          font-weight: 500;
        }

        /* Video Loading State */
        .video-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0f1a;
          border-radius: 32px;
          z-index: 2;
        }

        .loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(20, 99, 33, 0.2);
          border-top-color: #146321;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Video Placeholder */
        .video-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0f1a 0%, #146321 100%);
          border-radius: 32px;
          z-index: 1;
        }

        .placeholder-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .placeholder-icon {
          font-size: 32px;
          opacity: 0.5;
          animation: pulse 2s ease-in-out infinite;
        }

        .placeholder-text {
          color: rgba(255, 255, 255, 0.5);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        /* Dashboard Content */
        .dashboard-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          z-index: 1;
        }

        /* Dashboard Header */
        .dashboard-header {
          background: #146321;
          padding: 28px 16px 12px;
          position: relative;
        }

        .dashboard-brand {
          color: white;
          font-size: 7px;
          letter-spacing: 0.1em;
          opacity: 0.8;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .dashboard-title {
          color: white;
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .dashboard-live {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse-dot 1.2s infinite;
        }

        .live-text {
          color: white;
          font-size: 6px;
          opacity: 0.6;
          font-weight: 600;
        }

        /* Stats Section */
        .dashboard-stats {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 7px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .stat-value {
          font-size: 8px;
          color: #4ade80;
          font-weight: 500;
        }

        .stat-bar-bg {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }

        .stat-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #146321, #4ade80);
          border-radius: 99px;
          width: 0%;
          position: relative;
          overflow: hidden;
        }

        .stat-bar-fill.animate {
          animation: bar-grow 1.2s ease-out forwards;
        }

        .stat-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2.5s infinite;
        }

        /* Chart Card */
        .dashboard-chart {
          margin: 8px 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 10px;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 50px;
          gap: 8px;
        }

        .chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .chart-bar {
          width: 18px;
          background: #146321;
          border-radius: 3px 3px 0 0;
          animation: bar-pulse 3s ease-in-out infinite;
        }

        .chart-label {
          font-size: 5px;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 600;
        }

        /* Footer */
        .dashboard-footer {
          border-top: 0.5px solid rgba(255, 255, 255, 0.07);
          padding: 6px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-text {
          font-size: 6px;
          color: rgba(255, 255, 255, 0.3);
        }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          background: #4ade80;
          border-radius: 50%;
        }

        .status-text {
          font-size: 6px;
          color: #4ade80;
          opacity: 0.8;
          font-weight: 500;
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        @keyframes float {
          0%, 100% { 
            transform: perspective(1000px) rotateY(-15deg) rotateX(5deg) translateY(0px); 
          }
          50% { 
            transform: perspective(1000px) rotateY(-15deg) rotateX(5deg) translateY(-14px); 
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        @keyframes pulse-dot {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.4); 
          }
        }

        @keyframes bar-grow {
          from { width: 0%; }
          to { width: var(--bar-width); }
        }

        @keyframes shadow-pulse {
          0%, 100% { 
            opacity: 0.15; 
            transform: translateX(-50%) scaleX(1); 
          }
          50% { 
            opacity: 0.25; 
            transform: translateX(-50%) scaleX(0.88); 
          }
        }

        @keyframes bar-pulse {
          0%, 100% { 
            transform: scaleY(1); 
          }
          50% { 
            transform: scaleY(1.05); 
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .phone-frame, .skeleton-frame {
            width: 160px;
            height: 320px;
            animation: none;
            transform: none;
          }

          .phone-frame:hover {
            transform: none;
          }

          .phone-screen {
            top: 8px;
            left: 8px;
            right: 8px;
            bottom: 8px;
          }

          .dashboard-header {
            padding: 20px 12px 8px;
          }

          .dashboard-brand {
            font-size: 6px;
          }

          .dashboard-title {
            font-size: 12px;
          }

          .dashboard-stats {
            padding: 8px 10px;
            gap: 8px;
          }

          .chart-bars {
            height: 35px;
          }

          .chart-bar {
            width: 14px;
          }
        }
      `}</style>
    </div>
  );
}
