"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface Newsletter {
  id: string;
  title: string;
  month: number;
  year: number;
  slug?: string;
}

interface NewsletterArchiveProps {
  newsletters: Newsletter[];
  currentId?: string;
}

const MA = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MF = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function NewsletterArchive({ newsletters, currentId }: NewsletterArchiveProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentId]);

  if (!newsletters.length) return null;

  return (
    <>
      <style>{`
        /* ── Card — matches reference: page-bg color, very thin border ── */
        .nla-card {
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.07);
          background: #f5f8f5; /* same as page background */
          overflow: hidden;
          padding: 20px 16px 12px;
        }

        /* ── Header ── */
        .nla-hdr {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
          padding: 0 4px;
          margin-bottom: 4px;
        }
        .nla-hdr-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .nla-hdr-count {
          font-size: 0.5625rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #9ca3af;
          text-transform: uppercase;
          flex-shrink: 0;
        }

        /* ── Sub-label ── */
        .nla-sub {
          padding: 0 4px 14px;
          font-size: 0.8125rem;
          color: #9ca3af;
          font-style: normal;
        }

        /* ── List ── */
        .nla-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          overflow-x: hidden;
          max-height: 420px;
          scrollbar-width: thin;
          scrollbar-color: #d1fae5 transparent;
        }
        .nla-list::-webkit-scrollbar       { width: 3px; }
        .nla-list::-webkit-scrollbar-track { background: transparent; }
        .nla-list::-webkit-scrollbar-thumb { background: #c6e8c8; border-radius: 9999px; }

        /* ── Each archive item ── */
        .nla-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 12px;
          text-decoration: none;
          border-radius: 14px;
          border: 1px solid transparent;
          transition: border-color 0.15s, background 0.15s;
          min-width: 0;
          opacity: 0;
          animation: nla-fadein 0.3s ease forwards;
        }
        @keyframes nla-fadein {
          from { opacity:0; transform:translateX(-4px); }
          to   { opacity:1; transform:translateX(0); }
        }

        /* Inactive hover */
        .nla-item:not([data-active="true"]):hover {
          background: rgba(255,255,255,0.8);
          border-color: rgba(0,0,0,0.06);
        }

        /* Active item — green tint card */
        .nla-item[data-active="true"] {
          background: rgba(20,99,33,0.06);
          border-color: rgba(20,99,33,0.18);
        }

        /* ── Date tile — larger, cleaner ── */
        .nla-tile {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          overflow: hidden;
          background: #e9ede9;
          transition: background 0.15s;
          box-sizing: border-box;
        }
        .nla-item[data-active="true"] .nla-tile {
          background: #146321;
        }
        .nla-item:not([data-active="true"]):hover .nla-tile {
          background: #ddeedd;
        }

        .nla-tile-mo {
          font-size: 0.5625rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          line-height: 1;
          color: #6b7280;
          display: block;
          white-space: nowrap;
        }
        .nla-item[data-active="true"] .nla-tile-mo {
          color: rgba(255,255,255,0.8);
        }

        .nla-tile-yr {
          font-family: 'Syne', sans-serif;
          font-size: 0.875rem;
          font-weight: 800;
          line-height: 1.1;
          color: #374151;
          display: block;
          white-space: nowrap;
        }
        .nla-item[data-active="true"] .nla-tile-yr {
          color: #ffffff;
        }

        /* ── Text block ── */
        .nla-text {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        .nla-title {
          font-size: 0.9375rem;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          margin-bottom: 3px;
          transition: color 0.15s;
          line-height: 1.3;
        }
        .nla-item[data-active="true"] .nla-title {
          font-weight: 700;
          color: #146321;
        }
        .nla-item:not([data-active="true"]):hover .nla-title {
          color: #146321;
        }
        .nla-date {
          font-size: 0.75rem;
          color: #9ca3af;
          display: block;
          white-space: nowrap;
        }

        /* ── Chevron ── */
        .nla-chev {
          flex-shrink: 0;
          color: #d1d5db;
          transition: color 0.15s, transform 0.15s;
        }
        .nla-item[data-active="true"] .nla-chev { color: #146321; }
        .nla-item:hover .nla-chev { color: #146321; transform: translateX(2px); }

        /* ── Footer ── */
        .nla-footer { padding: 10px 4px 4px; }
        .nla-view-all {
          display: block;
          width: 100%;
          text-align: center;
          border-radius: 9999px;
          border: 1px solid rgba(0,0,0,0.1);
          padding: 9px 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          background: transparent;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .nla-view-all:hover {
          border-color: #146321;
          color: #146321;
          background: rgba(20,99,33,0.04);
        }
      `}</style>

      <div className="nla-card">
        {/* Header */}
        <div className="nla-hdr">
          <h3 className="nla-hdr-title">Newsletter Archive</h3>
          <span className="nla-hdr-count">{newsletters.length} Editions</span>
        </div>

        {/* Sub-label */}
        <div className="nla-sub">Browse previous monthly briefings</div>

        {/* List */}
        <div className="nla-list" ref={listRef}>
          {newsletters.map((nl, i) => {
            const active = nl.id === currentId;
            const mo   = MA[nl.month - 1] ?? "";
            const mf   = MF[nl.month - 1] ?? "";
            const href = nl.slug
              ? `/newsletter/${nl.slug}/1`
              : `/newsletter/${nl.year}/${nl.month}`;

            return (
              <Link
                key={nl.id}
                href={href}
                className="nla-item"
                data-active={active ? "true" : "false"}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Date tile */}
                <div className="nla-tile">
                  <span className="nla-tile-mo">{mo}</span>
                  <span className="nla-tile-yr">{nl.year}</span>
                </div>

                {/* Title + date */}
                <div className="nla-text">
                  <span className="nla-title">{nl.title}</span>
                  <span className="nla-date">{mf} {nl.year}</span>
                </div>

                {/* Chevron */}
                <ChevronRight size={16} className="nla-chev" />
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="nla-footer">
          <a href="/newsletter" className="nla-view-all">View full archive ›</a>
        </div>
      </div>
    </>
  );
}
