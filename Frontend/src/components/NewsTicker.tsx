"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  type: string;
  publishDate: string;
}

interface NewsTickerProps {
  newsItems: NewsItem[];
}

export default function NewsTicker({ newsItems }: NewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!newsItems || newsItems.length === 0 || !isVisible) return null;

  // Duplicate items for seamless loop
  const duplicatedItems = [...newsItems, ...newsItems];

  return (
    <div style={{
      position: "relative",
      width: "100%",
      backgroundColor: "#146321",
      borderBottom: "2px solid rgba(212, 175, 55, 0.3)",
      overflow: "hidden",
      zIndex: 40
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 16px"
      }}>
        {/* Label */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 20px 12px 0",
          borderRight: "1px solid rgba(255, 255, 255, 0.2)",
          flexShrink: 0
        }}>
          <Bell style={{ width: "16px", height: "16px", color: "#D4AF37" }} />
          <span style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
            whiteSpace: "nowrap"
          }}>
            Latest Updates
          </span>
        </div>

        {/* Ticker Content */}
        <div 
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
            padding: "12px 0"
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            style={{
              display: "flex",
              gap: "48px",
              animation: isPaused ? "none" : "scroll 40s linear infinite",
              paddingLeft: "24px"
            }}
          >
            {duplicatedItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                <span style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontWeight: 500
                }}>
                  {item.excerpt}
                </span>
                <span style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "#D4AF37"
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          style={{
            padding: "12px",
            marginLeft: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255, 255, 255, 0.7)",
            transition: "color 0.2s",
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
          onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
          aria-label="Close ticker"
        >
          <X style={{ width: "16px", height: "16px" }} />
        </button>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
