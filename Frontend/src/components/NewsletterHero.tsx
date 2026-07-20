"use client";

import { Calendar, Clock, User } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { getS3ImageUrl } from "@/lib/api";

interface Newsletter {
  id: string;
  title: string;
  month: number;
  year: number;
  coverImage?: string;
  publishedDate: string;
  excerpt?: string;
  content?: string;
}

interface NewsletterHeroProps {
  newsletter: Newsletter;
  editionNumber?: number;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function readingTime(html = ""): number {
  const words = html.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function NewsletterHero({ newsletter, editionNumber }: NewsletterHeroProps) {
  const month     = MONTHS[newsletter.month - 1] ?? "";
  const pubDate   = new Date(newsletter.publishedDate);
  const coverUrl  = newsletter.coverImage
    ? getS3ImageUrl(newsletter.coverImage) || newsletter.coverImage
    : null;
  const mins      = readingTime((newsletter as any).content ?? "");

  return (
    <>
      <style>{`
        /* ── Hero keyframes ── */
        @keyframes nlh-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nlh-kb   { from{transform:scale(1.06)} to{transform:scale(1)} }
        @keyframes nlh-dot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.7)} }

        /* ── Outer wrapper ── */
        .nlh-wrap {
          max-width: 1280px;
          margin: 0 auto;
          padding: 104px 24px 0;
        }
        @media(min-width:1024px){ .nlh-wrap{ padding:104px 40px 0; } }
        @media(max-width:768px){ .nlh-wrap{ padding:88px 16px 0; } }

        /* ── Card ── */
        .nlh-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: #0a2e10;
          border: 1px solid rgba(20,99,33,0.25);
          margin-top: 0;
        }

        /* ── Cover image ── */
        .nlh-img-wrap { position:absolute; inset:0; overflow:hidden; }
        .nlh-img {
          width:100%; height:100%; object-fit:cover;
          opacity:0.55;
          animation: nlh-kb 10s ease-out forwards;
        }

        /* ── Gradient overlay ── */
        .nlh-overlay {
          position:absolute; inset:0;
          background: linear-gradient(
            to bottom,
            rgba(10,46,16,0.38) 0%,
            rgba(10,46,16,0.68) 45%,
            rgba(10,46,16,0.97) 100%
          );
        }

        /* ── Fallback (no image) ── */
        .nlh-fallback {
          position:absolute; inset:0;
          background: linear-gradient(135deg,#050f07 0%,#0a2e10 45%,#146321 100%);
        }
        .nlh-fallback::after {
          content:''; position:absolute; inset:0;
          background-image:
            radial-gradient(ellipse at 12% 70%,rgba(255,255,255,0.04) 0%,transparent 52%),
            radial-gradient(ellipse at 88% 15%,rgba(255,255,255,0.06) 0%,transparent 44%);
        }

        /* ── Content ── */
        .nlh-content {
          position:relative; z-index:10;
          padding: 80px 48px 72px;
          text-align: center;
          display:flex; flex-direction:column; align-items:center;
        }
        @media(max-width:768px){
          .nlh-content { padding:56px 24px 52px; }
        }

        /* Badge */
        .nlh-badge {
          display:inline-flex; align-items:center; gap:8px;
          border-radius:9999px;
          border:1px solid rgba(255,255,255,0.22);
          background:rgba(255,255,255,0.09);
          backdrop-filter:blur(10px);
          padding:6px 18px;
          font-size:0.6rem; font-weight:800; letter-spacing:0.22em;
          color:rgba(255,255,255,0.88); text-transform:uppercase;
          margin-bottom:20px;
          opacity:0; animation:nlh-up 0.55s 0.05s ease forwards;
        }
        .nlh-badge-dot {
          width:6px; height:6px; border-radius:50%; background:#4ade80;
          flex-shrink:0; animation:nlh-dot 2.2s ease-in-out infinite;
        }

        /* Edition kicker */
        .nlh-kicker {
          font-size:0.6875rem; font-weight:600; letter-spacing:0.3em;
          color:rgba(255,255,255,0.5); text-transform:uppercase;
          margin-bottom:16px;
          opacity:0; animation:nlh-up 0.5s 0.18s ease forwards;
        }

        /* Title */
        .nlh-title {
          font-family:'Syne',sans-serif;
          font-size:clamp(1.75rem,4vw,3rem);
          font-weight:600; line-height:1.12; letter-spacing:-0.025em;
          color:#ffffff; max-width:820px;
          margin-bottom:20px;
          opacity:0; animation:nlh-up 0.65s 0.30s ease forwards;
        }

        /* Excerpt */
        .nlh-excerpt {
          font-size:clamp(0.9375rem,1.5vw,1.0625rem);
          line-height:1.72; color:rgba(255,255,255,0.72);
          max-width:640px; margin-bottom:28px;
          opacity:0; animation:nlh-up 0.55s 0.42s ease forwards;
        }

        /* Meta row */
        .nlh-meta {
          display:flex; flex-wrap:wrap; justify-content:center;
          align-items:center; gap:6px 20px;
          opacity:0; animation:nlh-up 0.5s 0.54s ease forwards;
        }
        .nlh-meta-item {
          display:flex; align-items:center; gap:5px;
          font-size:0.75rem; color:rgba(255,255,255,0.52);
        }
        .nlh-meta-sep {
          width:3px; height:3px; border-radius:50%;
          background:rgba(255,255,255,0.22); flex-shrink:0;
        }
      `}</style>

      <div className="nlh-wrap">
        <div className="nlh-card">
          {/* Image / fallback */}
          {coverUrl ? (
            <>
              <div className="nlh-img-wrap">
                <OptimizedImage
                  src={coverUrl}
                  alt={newsletter.title}
                  fill
                  className="nlh-img"
                  sizes="(max-width:1280px) 100vw, 1280px"
                  priority
                />
              </div>
              <div className="nlh-overlay" />
            </>
          ) : (
            <div className="nlh-fallback" />
          )}

          {/* Text */}
          <div className="nlh-content">
            <div className="nlh-badge">
              <span className="nlh-badge-dot" />
              Monthly Newsletter
            </div>

            <p className="nlh-kicker">
              {month.toUpperCase()} · {newsletter.year}
              {editionNumber ? ` · Edition ${editionNumber}` : ""}
            </p>

            <h1 className="nlh-title">{newsletter.title}</h1>

            {newsletter.excerpt && (
              <p className="nlh-excerpt">{newsletter.excerpt}</p>
            )}

            <div className="nlh-meta">
              <span className="nlh-meta-item">
                <Calendar size={13} />
                Published {pubDate.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
              </span>
              <span className="nlh-meta-sep" />
              <span className="nlh-meta-item">
                <Clock size={13} />
                {mins} min read
              </span>
              <span className="nlh-meta-sep" />
              <span className="nlh-meta-item">
                <User size={13} />
                By the WPC Research Desk
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
