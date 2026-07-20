"use client";

interface NewsletterAboutProps {
  excerpt?: string;
  publishedDate: string;
  editionNumber?: number;
  readingTime: number;
}

export default function NewsletterAbout({
  excerpt,
  publishedDate,
  editionNumber,
  readingTime,
}: NewsletterAboutProps) {
  const pubDate = new Date(publishedDate);

  return (
    <>
      <style>{`
        .nlab-card {
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.07);
          background: #f5f8f5;
          padding: 20px 18px;
        }
        .nlab-label {
          font-size: 0.5625rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          color: #146321;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: block;
        }
        .nlab-desc {
          font-size: 0.8125rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .nlab-dl { display: flex; flex-direction: column; }
        .nlab-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          gap: 8px;
        }
        .nlab-row:last-child { border-bottom: none; }
        .nlab-key {
          font-size: 0.5625rem;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          flex-shrink: 0;
        }
        .nlab-val {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          text-align: right;
        }
      `}</style>

      <div className="nlab-card">
        <span className="nlab-label">About This Edition</span>
        {excerpt && <p className="nlab-desc">{excerpt}</p>}
        <div className="nlab-dl">
          {editionNumber && (
            <div className="nlab-row">
              <span className="nlab-key">Edition</span>
              <span className="nlab-val">No. {editionNumber}</span>
            </div>
          )}
          <div className="nlab-row">
            <span className="nlab-key">Published</span>
            <span className="nlab-val">
              {pubDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="nlab-row">
            <span className="nlab-key">Author</span>
            <span className="nlab-val">WPC Research Desk</span>
          </div>
          <div className="nlab-row">
            <span className="nlab-key">Reading Time</span>
            <span className="nlab-val">{readingTime} min</span>
          </div>
        </div>
      </div>
    </>
  );
}
