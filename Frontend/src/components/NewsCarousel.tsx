"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Calendar, MapPin,
  ExternalLink, X, Clock, Share2, ArrowUpRight,
} from "lucide-react";
import { getS3ImageUrl } from "@/lib/api";

interface NewsItem {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishDate: string;
  eventDate?: string;
  eventLocation?: string;
  eventLink?: string;
}

interface NewsCarouselProps {
  newsItems: NewsItem[];
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  news:         { label: "News",         color: "#146321", bg: "rgba(20,99,33,0.08)"   },
  event:        { label: "Event",        color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  announcement: { label: "Announcement", color: "#b45309", bg: "rgba(180,83,9,0.08)"   },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function readTime(text: string) {
  const words = (text ?? "").replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ─── Card ────────────────────────────────────────────────────────────────────
function NewsCard({ item, index, onClick }: { item: NewsItem; index: number; onClick: () => void }) {
  const cfg    = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.news;
  const imgUrl = item.coverImage ? getS3ImageUrl(item.coverImage) || "" : "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.42, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
      style={{
        background: "#ffffff", borderRadius: "20px", overflow: "hidden",
        border: "1px solid #e8ede8", cursor: "pointer",
        display: "flex", flexDirection: "column", height: "100%",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.25s ease",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "200px", overflow: "hidden", background: "#f0f4f0", flexShrink: 0 }}>
        {imgUrl ? (
          <img
            src={imgUrl} alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg,#0a2e10 0%,#146321 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "2.5rem", opacity: 0.3 }}>📰</span>
          </div>
        )}
        <div style={{
          position: "absolute", top: "14px", left: "14px",
          background: cfg.bg, backdropFilter: "blur(8px)",
          border: `1px solid ${cfg.color}30`,
          borderRadius: "9999px", padding: "4px 12px",
          fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em",
          color: cfg.color, textTransform: "uppercase",
        }}>
          {cfg.label}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "22px 24px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "#9ca3af" }}>
            <Calendar size={12} />{formatDate(item.publishDate)}
          </span>
          <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#d1d5db", flexShrink: 0 }} />
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", color: "#9ca3af" }}>
            <Clock size={12} />{readTime(item.content)} min read
          </span>
        </div>

        <h3 style={{
          fontFamily: "'Syne',sans-serif", fontSize: "1.0625rem", fontWeight: 700,
          color: "#111827", lineHeight: 1.35, marginBottom: "10px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {item.title}
        </h3>

        <p style={{
          fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.65, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {item.excerpt}
        </p>

        {item.type === "event" && item.eventLocation && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "12px", fontSize: "0.8125rem", color: "#7c3aed" }}>
            <MapPin size={13} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.eventLocation}</span>
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f0f4f0",
          fontSize: "0.8125rem", fontWeight: 600, color: "#146321",
        }}>
          Read more <ArrowUpRight size={14} />
        </div>
      </div>
    </motion.article>
  );
}

//  Modal 
function NewsModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const cfg    = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.news;
  const imgUrl = item.coverImage ? getS3ImageUrl(item.coverImage) || "" : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(5,15,8,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          maxWidth: "760px", width: "100%",
          maxHeight: "90vh",
          /* Scroll the whole modal */
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.30)",
          /* Thin green scrollbar */
          scrollbarWidth: "thin",
          scrollbarColor: "#c6e8c8 transparent",
        }}
      >
        {/* ── Webkit scrollbar ── */}
        <style>{`
          .news-modal-inner::-webkit-scrollbar { width: 4px; }
          .news-modal-inner::-webkit-scrollbar-track { background: transparent; }
          .news-modal-inner::-webkit-scrollbar-thumb { background: #c6e8c8; border-radius: 9999px; }
        `}</style>

        {/* Close button — sticky top-right */}
        <button
          onClick={onClose}
          style={{
            position: "sticky", top: "16px", float: "right", marginRight: "16px",
            zIndex: 20, width: "36px", height: "36px", borderRadius: "50%",
            background: "rgba(0,0,0,0.50)", backdropFilter: "blur(8px)",
            border: "none", cursor: "pointer", color: "#ffffff",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.75)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.50)")}
        >
          <X size={18} />
        </button>

        {/* Hero image — flush top, no cut */}
        {imgUrl ? (
          <div style={{ height: "300px", overflow: "hidden", borderRadius: "24px 24px 0 0", marginTop: "-52px" }}>
            <img
              src={imgUrl} alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ) : (
          <div style={{
            height: "120px", borderRadius: "24px 24px 0 0", marginTop: "-52px",
            background: "linear-gradient(135deg,#0a2e10 0%,#146321 100%)",
          }} />
        )}

        {/* Body */}
        <div style={{ padding: "28px 32px 36px" }}>

          {/* Type + meta */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{
              background: cfg.bg, border: `1px solid ${cfg.color}30`,
              borderRadius: "9999px", padding: "4px 14px",
              fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em",
              color: cfg.color, textTransform: "uppercase",
            }}>
              {cfg.label}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8125rem", color: "#9ca3af" }}>
              <Calendar size={13} />{formatDate(item.publishDate)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8125rem", color: "#9ca3af" }}>
              <Clock size={13} />{readTime(item.content)} min read
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: "clamp(1.375rem,3vw,1.875rem)",
            fontWeight: 800, color: "#0d1f10",
            lineHeight: 1.2, letterSpacing: "-0.025em", marginBottom: "16px",
          }}>
            {item.title}
          </h2>

          {/* Excerpt */}
          {item.excerpt && (
            <p style={{
              fontSize: "1rem", color: "#4b5563", lineHeight: 1.75,
              marginBottom: "22px", fontStyle: "italic",
              borderLeft: "3px solid #146321", paddingLeft: "16px",
            }}>
              {item.excerpt}
            </p>
          )}

          {/* Full content */}
          {item.content && (
            <div style={{ fontSize: "0.9375rem", color: "#374151", lineHeight: 1.82, whiteSpace: "pre-wrap" }}>
              {item.content}
            </div>
          )}

          {/* ── Event details — always shown at bottom for events ── */}
          {item.type === "event" && (item.eventDate || item.eventLocation || item.eventLink) && (
            <div style={{
              marginTop: "32px", padding: "22px 24px",
              background: "rgba(124,58,237,0.04)",
              border: "1px solid rgba(124,58,237,0.18)",
              borderRadius: "16px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "rgba(124,58,237,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MapPin size={14} color="#7c3aed" />
                </div>
                <h4 style={{ fontFamily: "'Syne',sans-serif", fontSize: "0.9375rem", fontWeight: 700, color: "#111827", margin: 0 }}>
                  Event Details
                </h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Date */}
                {item.eventDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "rgba(124,58,237,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Calendar size={15} color="#7c3aed" />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.625rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Date</p>
                      <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#111827", margin: 0 }}>{formatDate(item.eventDate)}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {item.eventLocation && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "rgba(124,58,237,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <MapPin size={15} color="#7c3aed" />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.625rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Location</p>
                      <p style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#111827", margin: 0 }}>{item.eventLocation}</p>
                    </div>
                  </div>
                )}

                {/* Link */}
                {item.eventLink && (
                  <div>
                    <a
                      href={item.eventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "7px",
                        padding: "10px 22px",
                        background: "#7c3aed", color: "#ffffff",
                        borderRadius: "9999px", textDecoration: "none",
                        fontSize: "0.875rem", fontWeight: 600,
                        transition: "background 0.2s, transform 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#6d28d9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <ExternalLink size={14} />
                      Visit Event
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Share */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            gap: "10px", marginTop: "28px", paddingTop: "18px",
            borderTop: "1px solid #f0f4f0",
          }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#c4ccc4", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Share
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "34px", height: "34px", borderRadius: "50%",
                border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer",
                color: "#6b7280", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#146321"; e.currentTarget.style.color = "#146321"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
              title="Copy link"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function NewsCarousel({ newsItems }: NewsCarouselProps) {
  const [page,      setPage]      = useState(0);
  const [selected,  setSelected]  = useState<NewsItem | null>(null);
  const [direction, setDirection] = useState(1);

  if (!newsItems?.length) return null;

  const PER_PAGE   = 3;
  const totalPages = Math.ceil(newsItems.length / PER_PAGE);
  const visible    = newsItems.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const go = (dir: number) => {
    setDirection(dir);
    setPage(p => (p + dir + totalPages) % totalPages);
  };

  return (
    <>
      <section style={{ background: "#f5f8f5", padding: "88px 24px 96px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#146321", display: "inline-block" }} />
                <span style={{ fontSize: "0.6875rem", fontWeight: 800, letterSpacing: "0.16em", color: "#146321", textTransform: "uppercase" }}>
                  Latest Updates
                </span>
              </div>
              <h2 style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: "clamp(1.75rem,3.5vw,2.5rem)",
                fontWeight: 800, color: "#0d1f10",
                letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0,
              }}>
                News & <span style={{ color: "#146321" }}>Events</span>
              </h2>
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  onClick={() => go(-1)}
                  style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    border: "1px solid #e8ede8", background: "#ffffff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#374151", transition: "all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#146321"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#146321"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.borderColor = "#e8ede8"; }}
                >
                  <ChevronLeft size={18} />
                </button>

                <div style={{ display: "flex", gap: "6px" }}>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setDirection(i > page ? 1 : -1); setPage(i); }}
                      style={{
                        width: i === page ? "28px" : "8px", height: "8px",
                        borderRadius: "4px",
                        background: i === page ? "#146321" : "#d1d5db",
                        border: "none", cursor: "pointer", transition: "all 0.3s",
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => go(1)}
                  style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    border: "1px solid #e8ede8", background: "#ffffff",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#374151", transition: "all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#146321"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#146321"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.borderColor = "#e8ede8"; }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: "24px",
              }}
            >
              {visible.map((item, i) => (
                <NewsCard key={item.id} item={item} index={i} onClick={() => setSelected(item)} />
              ))}
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selected && <NewsModal item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}
