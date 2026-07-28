import { Metadata } from 'next';
import { getNewsletters } from '@/lib/api';
import NewsletterHero from '@/components/NewsletterHero';
import NewsletterViewer from '@/components/NewsletterViewer';
import NewsletterArchive from '@/components/NewsletterArchive';
import NewsletterAbout from '@/components/NewsletterAbout';
import NewsletterScrollProgress from '@/components/NewsletterScrollProgress';
import NewsletterShareRail from '@/components/NewsletterShareRail';
import NewsletterStickyFix from '@/components/NewsletterStickyFix';
import NewsletterLayout from '@/components/NewsletterLayout';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Newsletter | West Palm Consultants',
  description: 'One thoughtful briefing each month — market intelligence, advisory perspectives, and the questions our clients are asking.',
};

export const revalidate = 300;

export default async function NewsletterPage() {
  const newsletters = await getNewsletters();
  const latest = newsletters[0] ?? null;
  const total  = newsletters.length;

  return (
    <>
      <style>{`
        /* ─── Page ─── */
        .nlp-page { min-height:100vh; background:#f5f8f5; padding-top:clamp(100px, 14vh, 140px); }

        /* ─── Two-column grid ─── */
        .nlp-wrap {
          max-width:1280px; margin:0 auto;
          padding:0 24px 80px;
          display:grid;
          grid-template-columns:1fr;
          gap:28px;
          align-items:start;
        }
        @media(min-width:1024px){
          .nlp-wrap {
            padding:0 40px 80px;
            grid-template-columns:1fr 300px;
            gap:32px;
            overflow: visible;
          }
        }

        /* Left col */
        .nlp-main { min-width:0; }

        /* Right col — sticky sidebar */
        .nlp-sidebar {
          display:flex; flex-direction:column; gap:16px; min-width:0;
        }
        @media(min-width:1024px){
          .nlp-sidebar {
            position: sticky;
            top: 96px;
            align-self: start;
            height: fit-content;
            overflow: visible;
          }
        }

        /* ─── About this edition card (sidebar) ─── */
        .nlp-about-card {
          border-radius:16px; border:1px solid #e8ede8;
          background:#f8faf8; padding:20px 18px;
          box-shadow:0 2px 10px rgba(0,0,0,0.04);
        }
        .nlp-about-label {
          font-size:0.5625rem; font-weight:800; letter-spacing:0.16em;
          color:#b0b8b0; text-transform:uppercase; margin-bottom:10px;
        }
        .nlp-about-desc {
          font-size:0.8125rem; color:#6b7280; line-height:1.6;
          margin-bottom:14px; border-bottom:1px solid #edf2ed; padding-bottom:12px;
        }
        .nlp-about-dl { display:flex; flex-direction:column; }
        .nlp-about-row {
          display:flex; justify-content:space-between; align-items:baseline;
          padding:8px 0; border-bottom:1px solid #f0f4f0; gap:8px;
        }
        .nlp-about-row:last-child { border-bottom:none; }
        .nlp-about-key {
          font-size:0.5625rem; font-weight:800; color:#c4ccc4;
          text-transform:uppercase; letter-spacing:0.12em; flex-shrink:0;
        }
        .nlp-about-val {
          font-family:'Syne',sans-serif; font-size:0.8125rem;
          font-weight:700; color:#111827; text-align:right;
        }

        /* ─── Subscribe CTA card ─── */
        .nlp-cta-wrap { padding:0 24px 80px; }
        @media(min-width:1024px){ .nlp-cta-wrap{ padding:0 40px 80px; } }
        .nlp-cta-card {
          max-width:1280px; margin:0 auto;
          border-radius:24px; border:1px solid rgba(20,99,33,0.14);
          background:linear-gradient(135deg,#f8faf8 0%,#ffffff 50%,#f8faf8 100%);
          padding:56px 32px; text-align:center;
        }
        @media(min-width:640px){ .nlp-cta-card{ padding:72px 64px; } }
        .nlp-cta-pill {
          display:inline-flex; align-items:center; gap:6px;
          border-radius:9999px; border:1px solid rgba(20,99,33,0.22);
          background:rgba(20,99,33,0.05); padding:5px 14px;
          font-size:0.5625rem; font-weight:800; letter-spacing:0.2em;
          color:#146321; text-transform:uppercase; margin-bottom:20px;
        }
        .nlp-cta-h2 {
          font-family:'Syne',sans-serif;
          font-size:clamp(1.5rem,3vw,2.25rem);
          font-weight:800; color:#0d1f10;
          letter-spacing:-0.03em; line-height:1.15; margin-bottom:12px;
        }
        .nlp-cta-desc {
          font-size:0.9375rem; color:#6b7280; line-height:1.72;
          max-width:480px; margin:0 auto 28px;
        }
        .nlp-cta-form {
          display:flex; gap:10px; max-width:420px;
          margin:0 auto 10px; flex-wrap:wrap;
        }
        @media(min-width:480px){ .nlp-cta-form{ flex-wrap:nowrap; } }
        .nlp-cta-input {
          flex:1; min-width:0; padding:11px 20px;
          border-radius:9999px; border:1px solid #d1d5db;
          background:#ffffff; font-size:0.9375rem; color:#111827;
          outline:none; font-family:'Inter',sans-serif;
          transition:border-color 0.15s, box-shadow 0.15s;
        }
        .nlp-cta-input:focus {
          border-color:#146321;
          box-shadow:0 0 0 3px rgba(20,99,33,0.12);
        }
        .nlp-cta-btn {
          flex-shrink:0; background:#146321; color:#ffffff;
          border-radius:9999px; padding:11px 24px;
          font-size:0.9375rem; font-weight:600; text-decoration:none;
          white-space:nowrap; transition:background 0.15s, transform 0.15s;
        }
        .nlp-cta-btn:hover { background:#0d4016; transform:translateY(-1px); }
        .nlp-cta-note { font-size:0.75rem; color:#b0b8b0; }

        /* ─── Empty state ─── */
        .nlp-empty {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; min-height:360px;
          border-radius:16px; border:2px dashed #d1d5db;
          background:#ffffff; text-align:center; padding:48px;
          margin:40px 0;
        }
      `}</style>

      <div className="nlp-page">

        {latest ? (
          <>
            {/* Fixed scroll progress */}
            <NewsletterScrollProgress />

            {/* Disable Lenis so position:sticky works */}
            <NewsletterStickyFix />

            {/* Fixed left share rail (xl+) */}
            <NewsletterShareRail title={latest.title} />

            {/* Full-width hero */}
            <NewsletterHero newsletter={latest} editionNumber={total} />

            {/* Two-column layout with JS-driven sticky sidebar */}
            <NewsletterLayout
              article={<NewsletterViewer newsletter={latest} editionNumber={total} />}
              archive={<NewsletterArchive newsletters={newsletters} currentId={latest.id} />}
              about={
                <NewsletterAbout
                  excerpt={latest.excerpt}
                  publishedDate={latest.publishedDate}
                  editionNumber={total}
                  readingTime={Math.max(1, Math.ceil(latest.content.replace(/<[^>]*>/g,"").trim().split(/\s+/).length / 200))}
                />
              }
            />
          </>
        ) : (
          <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"0 24px" }}>
            <div className="nlp-empty">
              <Mail size={44} color="#d1d5db" style={{ marginBottom:"14px" }} />
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.125rem", fontWeight:700, color:"#374151", marginBottom:"6px" }}>
                No newsletters published yet
              </h2>
              <p style={{ fontSize:"0.875rem", color:"#9ca3af" }}>Check back soon for our first edition.</p>
            </div>
          </div>
        )}

        {/* Subscribe CTA */}
        <div className="nlp-cta-wrap">
          <div className="nlp-cta-card">
            <div className="nlp-cta-pill">
              <Mail size={10} />
              Monthly Briefing
            </div>
            <h2 className="nlp-cta-h2">Stay updated with West Palm Consultants</h2>
            <p className="nlp-cta-desc">
              One thoughtful briefing each month — market intelligence, advisory perspectives, and the questions our clients are asking. No noise.
            </p>
            <div className="nlp-cta-form">
              <input type="email" placeholder="you@company.com" className="nlp-cta-input" />
              <a href="/contact" className="nlp-cta-btn">Subscribe</a>
            </div>
            <p className="nlp-cta-note">Join 12,000+ executives. Unsubscribe anytime.</p>
          </div>
        </div>

      </div>
    </>
  );
}
