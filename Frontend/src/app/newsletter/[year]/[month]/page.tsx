import { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}): Promise<Metadata> {
  const { year, month } = await params;
  const newsletters = await getNewsletters();

  let nl = newsletters.find((n: any) => n.slug === year);
  if (!nl) {
    const y = parseInt(year), m = parseInt(month);
    nl = newsletters.find(
      (n: any) => Number(n.year) === y && Number(n.month) === m
    );
  }
  if (!nl) return { title: 'Newsletter Not Found | West Palm Consultants' };

  return {
    title: nl.seo?.metaTitle || `${nl.title} | West Palm Consultants`,
    description: nl.seo?.metaDescription || nl.excerpt || nl.title,
    keywords: nl.seo?.keywords?.join(', '),
    openGraph: {
      title: nl.title,
      description: nl.excerpt || nl.title,
      images: nl.coverImage ? [nl.coverImage] : [],
      type: 'article',
      publishedTime: nl.publishedDate,
    },
    twitter: {
      card: 'summary_large_image',
      title: nl.title,
      description: nl.excerpt || nl.title,
      images: nl.coverImage ? [nl.coverImage] : [],
    },
  };
}

export const revalidate = 300;

export default async function NewsletterArchivePage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const newsletters = await getNewsletters();

  let newsletter = newsletters.find((n: any) => n.slug === year);
  if (!newsletter) {
    const y = parseInt(year), m = parseInt(month);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) notFound();
    // Coerce to number — DynamoDB may return year/month as string or number
    newsletter = newsletters.find(
      (n: any) => Number(n.year) === y && Number(n.month) === m
    );
  }
  if (!newsletter) notFound();

  const editionNumber = newsletters.length - newsletters.indexOf(newsletter);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthName = MONTHS[newsletter.month - 1] ?? "";

  return (
    <>
      <style>{`
        .nlp-page { min-height:100vh; background:#f5f8f5; }

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
      `}</style>

      <div className="nlp-page">

        {/* Fixed scroll progress */}
        <NewsletterScrollProgress />

        {/* Disable Lenis so position:sticky works */}
        <NewsletterStickyFix />

        {/* Fixed left share rail (xl+) */}
        <NewsletterShareRail title={newsletter.title} />

        {/* Full-width hero */}
        <NewsletterHero newsletter={newsletter} editionNumber={editionNumber} />

        {/* Two-column layout with JS-driven sticky sidebar */}
        <NewsletterLayout
          article={<NewsletterViewer newsletter={newsletter} editionNumber={editionNumber} />}
          archive={<NewsletterArchive newsletters={newsletters} currentId={newsletter.id} />}
          about={
            <NewsletterAbout
              excerpt={newsletter.excerpt}
              publishedDate={newsletter.publishedDate}
              editionNumber={editionNumber}
              readingTime={Math.max(1, Math.ceil(newsletter.content.replace(/<[^>]*>/g,"").trim().split(/\s+/).length / 200))}
            />
          }
        />

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
