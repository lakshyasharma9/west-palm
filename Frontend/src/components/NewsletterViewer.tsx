"use client";

import { Twitter, Linkedin, Link2, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Newsletter {
  id: string;
  title: string;
  content: string;
  month: number;
  year: number;
  coverImage?: string;
  publishedDate: string;
  views?: number;
  excerpt?: string;
  slug?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

interface NewsletterViewerProps {
  newsletter: Newsletter;
  editionNumber?: number;
}

function readingTime(html: string): number {
  const words = html.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Smart image group detection and layout.
 *
 * Tiptap outputs images as: <p><img src="..." /></p>
 * We detect consecutive <p> tags that contain ONLY an <img> and group them.
 *
 * Layout rules:
 *   1 image  → full width
 *   2 images → 2 columns equal
 *   3 images → 3 columns equal
 *   4 images → 3 top + 1 full-width bottom
 *   5 images → 3 top + 2 bottom
 *   6 images → 3 top + 3 bottom
 */
function processImageGroups(html: string): string {
  // Match runs of consecutive <p> tags that contain only an <img>
  // A "pure image paragraph" looks like: <p><img ...></p> or <p><img ... /></p>
  const IMG_P = /(<p[^>]*>\s*<img[^>]*>\s*<\/p>)/g;

  // Split HTML into segments: image-only-p runs vs everything else
  const parts: Array<{ type: 'text' | 'img'; content: string; src?: string; alt?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex
  IMG_P.lastIndex = 0;

  while ((match = IMG_P.exec(html)) !== null) {
    // Text before this image paragraph
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: html.slice(lastIndex, match.index) });
    }
    // Extract src and alt from the img tag
    const srcMatch = match[0].match(/src="([^"]*)"/);
    const altMatch = match[0].match(/alt="([^"]*)"/);
    parts.push({
      type: 'img',
      content: match[0],
      src: srcMatch?.[1] ?? '',
      alt: altMatch?.[1] ?? '',
    });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < html.length) {
    parts.push({ type: 'text', content: html.slice(lastIndex) });
  }

  // Now merge consecutive image parts into groups
  const result: string[] = [];
  let i = 0;

  while (i < parts.length) {
    if (parts[i].type === 'text') {
      result.push(parts[i].content);
      i++;
    } else {
      // Collect consecutive images
      const group: typeof parts = [];
      while (i < parts.length && parts[i].type === 'img') {
        group.push(parts[i]);
        i++;
      }

      const count = group.length;
      const imgs  = group.map(p =>
        `<img src="${p.src}" alt="${p.alt}" class="nlv-img" loading="lazy" />`
      );

      if (count === 1) {
        // Single image — full width
        result.push(`<div class="nlv-img-grid nlv-img-grid-1">${imgs[0]}</div>`);
      } else if (count === 2) {
        result.push(`<div class="nlv-img-grid nlv-img-grid-2">${imgs.join('')}</div>`);
      } else if (count === 3) {
        result.push(`<div class="nlv-img-grid nlv-img-grid-3">${imgs.join('')}</div>`);
      } else if (count === 4) {
        // 3 top + 1 full-width bottom
        result.push(
          `<div class="nlv-img-grid nlv-img-grid-3">${imgs.slice(0, 3).join('')}</div>` +
          `<div class="nlv-img-grid nlv-img-grid-1" style="margin-top:10px">${imgs[3]}</div>`
        );
      } else if (count === 5) {
        // 3 top + 2 bottom
        result.push(
          `<div class="nlv-img-grid nlv-img-grid-3">${imgs.slice(0, 3).join('')}</div>` +
          `<div class="nlv-img-grid nlv-img-grid-2" style="margin-top:10px">${imgs.slice(3).join('')}</div>`
        );
      } else {
        // 6+ → rows of 3
        const rows: string[] = [];
        for (let r = 0; r < imgs.length; r += 3) {
          const row = imgs.slice(r, r + 3);
          rows.push(`<div class="nlv-img-grid nlv-img-grid-${row.length}" style="margin-top:${r > 0 ? '10px' : '0'}">${row.join('')}</div>`);
        }
        result.push(rows.join(''));
      }
    }
  }

  return result.join('');
}

/**
 * Also handle raw consecutive <img> tags (not wrapped in <p>) — legacy/direct inserts
 */
function wrapRawImageGroups(html: string): string {
  return html.replace(
    /((?:<img[^>]*\/?>[\s]*){2,})/g,
    (match) => {
      const imgs = (match.match(/<img[^>]*\/?>/g) ?? []).map(
        img => img.replace(/<img/, '<img class="nlv-img" loading="lazy"')
      );
      const count = imgs.length;
      if (count === 2) return `<div class="nlv-img-grid nlv-img-grid-2">${imgs.join('')}</div>`;
      if (count === 3) return `<div class="nlv-img-grid nlv-img-grid-3">${imgs.join('')}</div>`;
      if (count === 4) return (
        `<div class="nlv-img-grid nlv-img-grid-3">${imgs.slice(0,3).join('')}</div>` +
        `<div class="nlv-img-grid nlv-img-grid-1" style="margin-top:10px">${imgs[3]}</div>`
      );
      if (count === 5) return (
        `<div class="nlv-img-grid nlv-img-grid-3">${imgs.slice(0,3).join('')}</div>` +
        `<div class="nlv-img-grid nlv-img-grid-2" style="margin-top:10px">${imgs.slice(3).join('')}</div>`
      );
      // 6+
      const rows: string[] = [];
      for (let r = 0; r < imgs.length; r += 3) {
        const row = imgs.slice(r, r + 3);
        rows.push(`<div class="nlv-img-grid nlv-img-grid-${row.length}" style="margin-top:${r>0?'10px':'0'}">${row.join('')}</div>`);
      }
      return rows.join('');
    }
  );
}

function processContent(html: string): string {
  // Step 0: Convert editor's img-group divs → frontend nlv-img-grid divs
  // The admin editor saves multi-image groups as <div class="img-group img-group-N">
  // The frontend uses nlv-img-grid / nlv-img-grid-N classes
  let processed = html
    // Convert img-group wrapper divs
    .replace(
      /<div\s+class="img-group\s+img-group-(\d+)"([^>]*)>/g,
      (_m, n) => {
        const count = parseInt(n);
        // Map editor class to frontend grid class
        const gridClass = `nlv-img-grid nlv-img-grid-${Math.min(count, 3)}`;
        return `<div class="${gridClass}">`;
      }
    )
    // For 4-image groups: editor uses img-group-4 → we need 3+1 layout
    // Already handled above as nlv-img-grid-3, but we need to split the 4th image
    // This is handled by the CSS: .nlv-img-grid-3 has 3 cols, 4th img wraps to next row
    // Add nlv-img class to all imgs inside converted groups
    .replace(
      /(<div class="nlv-img-grid[^"]*">)([\s\S]*?)(<\/div>)/g,
      (_m, open, inner, close) => {
        const fixedInner = inner.replace(
          /<img(?![^>]*class="nlv-img")([^>]*)>/g,
          '<img$1 class="nlv-img" loading="lazy">'
        );
        return open + fixedInner + close;
      }
    );

  // Step 1: Handle <p><img></p> groups (Tiptap single-image output)
  processed = processImageGroups(processed);

  // Step 2: Handle any remaining raw consecutive <img> tags
  processed = wrapRawImageGroups(processed);

  return processed
    .replace(/<h1([^>]*)>/g, '<h1$1 class="nlv-h1">')
    .replace(/<h2([^>]*)>/g, '<h2$1 class="nlv-h2">')
    .replace(/<h3([^>]*)>/g, '<h3$1 class="nlv-h3">')
    .replace(/<h4([^>]*)>/g, '<h4$1 class="nlv-h4">')
    .replace(/<p([^>]*)>/g, (_m, attrs) => `<p${attrs} class="nlv-p">`)
    .replace(/<ul([^>]*)>/g, '<ul$1 class="nlv-ul">')
    .replace(/<ol([^>]*)>/g, '<ol$1 class="nlv-ol">')
    .replace(/<li([^>]*)>/g, '<li$1 class="nlv-li">')
    .replace(/<blockquote([^>]*)>/g, '<blockquote$1 class="nlv-bq">')
    .replace(/<strong([^>]*)>/g, '<strong$1 class="nlv-strong">')
    .replace(/<em([^>]*)>/g, '<em$1 class="nlv-em">')
    .replace(/<u([^>]*)>/g, '<u$1 class="nlv-u">')
    .replace(/<a ([^>]*)>/g, '<a $1 class="nlv-a">')
    // Any remaining single <img> not already processed — add class
    .replace(/<img(?![^>]*class="nlv-img")([^>]*)>/g, '<img$1 class="nlv-img" loading="lazy">');
}

function useReveal(threshold = 0.03) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

export default function NewsletterViewer({ newsletter, editionNumber }: NewsletterViewerProps) {
  const [copied, setCopied] = useState(false);
  const body   = useReveal(0.02);
  const footer = useReveal(0.03);

  const keywords = newsletter.seo?.keywords ?? [];

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2200); };
  const shareTw  = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(newsletter.title)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  const shareLi  = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank");

  return (
    <>
      <style>{`
        /* ── Reveal ── */
        .nlv-reveal { transition: opacity 0.6s ease, transform 0.6s ease; }
        .nlv-reveal.off { opacity:0; transform:translateY(14px); }
        .nlv-reveal.on  { opacity:1; transform:translateY(0); }

        /* ── Outer wrapper — NO border, NO card, clean editorial ── */
        .nlv-wrap {
          background: transparent;
          padding: 0;
        }

        /* ── Article prose area ── */
        .nlv-prose {
          max-width: 100%;
          background: transparent;
          padding: 44px 0 40px;
        }
        @media(max-width:768px){ .nlv-prose{ padding:32px 0 28px; } }
        @media(max-width:480px){ .nlv-prose{ padding:24px 0 20px; } }

        /* ── Prose typography ── */
        .nlv-p {
          font-family: 'Inter', sans-serif;
          font-size: 1.0625rem;
          line-height: 1.82;
          color: #374151;
          margin-top: 1.375rem;
          margin-bottom: 0;
        }

        .nlv-h1 {
          font-family: 'Syne', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: #0d1f10;
          margin-top: 3.5rem;
          margin-bottom: 1rem;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }
        .nlv-h2 {
          font-family: 'Syne', sans-serif;
          font-size: 1.625rem;
          font-weight: 700;
          color: #111827;
          margin-top: 3rem;
          margin-bottom: 0.875rem;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }
        .nlv-h3 {
          font-family: 'Syne', sans-serif;
          font-size: 1.1875rem;
          font-weight: 700;
          color: #146321;
          margin-top: 2.25rem;
          margin-bottom: 0.625rem;
          letter-spacing: -0.01em;
        }
        .nlv-h4 {
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #1f4d28;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
        }

        /* Lists */
        .nlv-ul {
          margin-top: 1.25rem;
          margin-bottom: 0;
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nlv-ol {
          margin-top: 1.25rem;
          margin-bottom: 0;
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nlv-li {
          font-family: 'Inter', sans-serif;
          font-size: 1.0625rem;
          line-height: 1.78;
          color: #374151;
          list-style-type: disc;
        }
        .nlv-ul .nlv-li::marker { color: #146321; }
        .nlv-ol .nlv-li { list-style-type: decimal; }

        /* Blockquote */
        .nlv-bq {
          border-left: 2px solid #146321;
          padding-left: 1.5rem;
          margin: 2.25rem 0;
        }
        .nlv-bq .nlv-p {
          font-family: 'Syne', sans-serif;
          font-size: 1.25rem;
          font-weight: 500;
          line-height: 1.45;
          color: #111827;
          margin-top: 0;
          font-style: normal;
        }

        /* Links */
        .nlv-a {
          color: #146321;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: rgba(20,99,33,0.3);
          transition: text-decoration-color 0.15s;
        }
        .nlv-a:hover { text-decoration-color: #146321; }

        .nlv-strong { font-weight: 700; color: #111827; }
        .nlv-em     { font-style: italic; }
        .nlv-u      { text-decoration: underline; text-underline-offset: 3px; }

        /* ── Single image ── */
        .nlv-img {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          border-radius: 12px;
          margin: 2rem 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          object-fit: cover;
        }

        /* ── Image grid containers ── */
        .nlv-img-grid {
          display: grid;
          gap: 10px;
          margin: 2rem 0;
          width: 100%;
        }

        /* 1 image — full width */
        .nlv-img-grid-1 { grid-template-columns: 1fr; }

        /* 2 images — equal columns */
        .nlv-img-grid-2 { grid-template-columns: 1fr 1fr; }

        /* 3 images — equal 3 columns */
        .nlv-img-grid-3 { grid-template-columns: 1fr 1fr 1fr; }

        /* ── Passthrough: editor img-group classes (fallback if not converted) ── */
        /* These match what the admin editor saves directly */
        .img-group {
          display: grid;
          gap: 10px;
          margin: 2rem 0;
          width: 100%;
        }
        .img-group-1 { grid-template-columns: 1fr; }
        .img-group-2 { grid-template-columns: 1fr 1fr; }
        .img-group-3 { grid-template-columns: 1fr 1fr 1fr; }
        .img-group-4 { grid-template-columns: 1fr 1fr 1fr; }
        .img-group-5 { grid-template-columns: 1fr 1fr 1fr; }
        .img-group-6 { grid-template-columns: 1fr 1fr 1fr; }
        /* 4th image in 4-group spans full width */
        .img-group-4 img:nth-child(4) { grid-column: 1 / -1; }
        .img-group img {
          width: 100% !important;
          height: 220px !important;
          object-fit: cover !important;
          border-radius: 10px;
          margin: 0 !important;
          display: block;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .img-group-1 img { height: auto !important; max-height: 480px !important; }

        /* All grid images — fixed height, cover */
        .nlv-img-grid .nlv-img {
          margin: 0 !important;
          width: 100% !important;
          height: 220px !important;
          object-fit: cover !important;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }

        /* 1-image grid: taller */
        .nlv-img-grid-1 .nlv-img {
          height: auto !important;
          max-height: 480px !important;
        }

        /* Responsive */
        @media(max-width:768px){
          .nlv-img-grid-2 { grid-template-columns: 1fr 1fr !important; }
          .nlv-img-grid-3 { grid-template-columns: 1fr 1fr !important; }
          .nlv-img-grid .nlv-img { height: 160px !important; }
        }
        @media(max-width:480px){
          .nlv-img-grid-2,
          .nlv-img-grid-3 { grid-template-columns: 1fr !important; }
          .nlv-img-grid .nlv-img { height: 200px !important; }
        }

        /* ── Divider ── */
        .nlv-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 3rem 0;
        }
        .nlv-divider-line { flex: 1; height: 1px; background: #e5e7eb; }
        .nlv-divider-dot  {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #146321;
          flex-shrink: 0;
        }

        /* ── Footer: keywords + share ── */
        .nlv-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .nlv-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .nlv-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          border: 1px solid rgba(20,99,33,0.28);
          font-size: 0.75rem;
          font-weight: 500;
          color: #146321;
          background: transparent;
          cursor: default;
          transition: background 0.15s, color 0.15s;
        }
        .nlv-tag:hover { background: #146321; color: #ffffff; }

        .nlv-share-row { display: flex; align-items: center; gap: 8px; margin-left: auto; }
        .nlv-share-label {
          font-size: 0.5625rem;
          font-weight: 800;
          color: #9ca3af;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .nlv-share-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 50%;
          border: 1px solid #e5e7eb; background: #fff;
          cursor: pointer; color: #6b7280;
          transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.15s;
        }
        .nlv-share-btn:hover {
          border-color: #146321; background: #f0faf1;
          color: #146321; transform: translateY(-2px);
        }
        .nlv-share-btn.copied { color: #146321; border-color: #146321; }

        /* ── Responsive ── */
        @media(max-width:768px) {
          .nlv-h1 { font-size:1.625rem !important; margin-top:2.5rem !important; }
          .nlv-h2 { font-size:1.375rem !important; margin-top:2.25rem !important; }
        }
      `}</style>

      {/* ── ARTICLE BODY ── */}
      <div className="nlv-wrap">
        <div className="nlv-prose">
          <div
            ref={body.ref}
            className={`nlv-reveal ${body.vis ? "on" : "off"}`}
            dangerouslySetInnerHTML={{ __html: processContent(newsletter.content) }}
          />

          {/* Divider */}
          <div className="nlv-divider">
            <div className="nlv-divider-line" />
            <div className="nlv-divider-dot" />
            <div className="nlv-divider-line" />
          </div>

          {/* Keywords + share */}
          <div ref={footer.ref} className={`nlv-reveal ${footer.vis ? "on" : "off"}`}>
            <div className="nlv-footer">
              {keywords.length > 0 && (
                <div className="nlv-tags">
                  {keywords.map(kw => <span key={kw} className="nlv-tag">{kw}</span>)}
                </div>
              )}
              <div className="nlv-share-row">
                <span className="nlv-share-label">Share</span>
                <button className="nlv-share-btn" onClick={shareTw} title="Share on Twitter">
                  <Twitter size={13} />
                </button>
                <button className="nlv-share-btn" onClick={shareLi} title="Share on LinkedIn">
                  <Linkedin size={13} />
                </button>
                <button className={`nlv-share-btn ${copied ? "copied" : ""}`} onClick={copyLink} title={copied ? "Copied!" : "Copy link"}>
                  {copied ? <Check size={13} /> : <Link2 size={13} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
