"use client";

import { Twitter, Linkedin, Link2, Check, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function NewsletterShareRail({ title }: { title: string }) {
  const [copied,  setCopied]  = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 340);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  };
  const tw = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`, "_blank");
  const li = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank");
  const native = () => {
    if (navigator.share) navigator.share({ title, url: window.location.href }).catch(() => {});
    else copyLink();
  };

  return (
    <>
      <style>{`
        .nlsr {
          position:fixed; left:18px; top:50%; z-index:9000;
          transform:translateY(-50%);
          display:none;
          flex-direction:column; align-items:center; gap:4px;
          transition:opacity 0.3s ease, transform 0.3s ease;
        }
        /* Only show at xl (≥1280px) */
        @media(min-width:1280px){ .nlsr{ display:flex; } }

        .nlsr.off { opacity:0; pointer-events:none; transform:translateY(-50%) translateX(-10px); }
        .nlsr.on  { opacity:1; pointer-events:auto; transform:translateY(-50%) translateX(0); }

        .nlsr-pill {
          display:flex; flex-direction:column; align-items:center; gap:2px;
          background:#ffffff; border:1px solid #e8ede8;
          border-radius:9999px; padding:10px 0;
          box-shadow:0 2px 14px rgba(0,0,0,0.08);
        }
        .nlsr-lbl {
          font-size:0.4375rem; font-weight:800; letter-spacing:0.16em;
          color:#c4ccc4; text-transform:uppercase;
          writing-mode:vertical-rl; transform:rotate(180deg);
          padding:0 10px; margin:4px 0 6px;
        }
        .nlsr-sep { width:18px; height:1px; background:#edf2ed; margin:2px 0; }
        .nlsr-btn {
          display:flex; align-items:center; justify-content:center;
          width:36px; height:36px; border-radius:50%;
          border:none; background:transparent; cursor:pointer;
          color:#6b7280; transition:background 0.15s, color 0.15s, transform 0.15s;
        }
        .nlsr-btn:hover { background:#f0faf1; color:#146321; transform:scale(1.12); }
        .nlsr-btn.copied { color:#146321; }
      `}</style>

      <aside className={`nlsr ${visible ? "on" : "off"}`}>
        <div className="nlsr-pill">
          <span className="nlsr-lbl">Share</span>
          <div className="nlsr-sep" />
          <button className="nlsr-btn" onClick={tw}     title="Share on Twitter">  <Twitter  size={14} /></button>
          <button className="nlsr-btn" onClick={li}     title="Share on LinkedIn"> <Linkedin size={14} /></button>
          <button className={`nlsr-btn ${copied ? "copied" : ""}`} onClick={copyLink} title={copied ? "Copied!" : "Copy link"}>
            {copied ? <Check size={14} /> : <Link2 size={14} />}
          </button>
          <button className="nlsr-btn" onClick={native} title="Share">             <Share2   size={14} /></button>
        </div>
      </aside>
    </>
  );
}
