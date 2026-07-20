"use client";

/**
 * NewsletterLayout
 *
 * Two-column layout:
 *   LEFT  — article content (scrolls normally)
 *   RIGHT — sticky archive card (pins while scrolling article)
 *             + about-edition card below (NOT sticky, acts as stop boundary)
 *
 * The archive stays pinned until its bottom would overlap the about card,
 * then it releases and scrolls naturally — exactly like modern editorial sites.
 */

import { useEffect, useRef, useState, ReactNode } from "react";

interface NewsletterLayoutProps {
  article:  ReactNode;
  archive:  ReactNode;
  about:    ReactNode;
}

export default function NewsletterLayout({ article, archive, about }: NewsletterLayoutProps) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const aboutRef   = useRef<HTMLDivElement>(null);

  const [pinned,      setPinned]      = useState(false);
  const [pinnedTop,   setPinnedTop]   = useState(96);
  const [pinnedLeft,  setPinnedLeft]  = useState(0);
  const [pinnedWidth, setPinnedWidth] = useState(300);
  const [isDesktop,   setIsDesktop]   = useState(false);

  useEffect(() => {
    const NAV_TOP = 96; // px from viewport top when pinned

    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);

    const onScroll = () => {
      if (!wrapRef.current || !archiveRef.current || !aboutRef.current) return;
      if (window.innerWidth < 1024) { setPinned(false); return; }

      const wrap    = wrapRef.current.getBoundingClientRect();
      const archive = archiveRef.current.getBoundingClientRect();
      const about   = aboutRef.current.getBoundingClientRect();
      const W       = 300;
      const L       = wrap.right - W;

      setPinnedWidth(W);
      setPinnedLeft(L);

      if (wrap.top <= NAV_TOP) {
        // Stop pinning when archive bottom would hit the about card top
        // (leave 16px gap between them)
        const archiveBottom = NAV_TOP + archive.height + 16;
        const aboutTop      = about.top; // relative to viewport

        if (archiveBottom >= aboutTop) {
          // Release — let it scroll naturally
          setPinned(false);
          // Position it so it sits just above the about card
          const scrolled = window.scrollY;
          const wrapTop  = wrapRef.current.getBoundingClientRect().top + scrolled;
          setPinnedTop(about.top + scrolled - wrapTop - archive.height - 16);
        } else {
          setPinned(true);
          setPinnedTop(NAV_TOP);
        }
      } else {
        setPinned(false);
        setPinnedTop(0);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    requestAnimationFrame(onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <style>{`
        /* ── Outer container ── */
        .nll-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          position: relative;
        }
        @media(min-width:1024px){
          .nll-wrap {
            padding: 48px 40px 80px;
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 40px;
            align-items: start;
          }
        }
        @media(max-width:640px){
          .nll-wrap { padding: 24px 16px 56px; }
        }

        /* ── Article column — NO border, NO card, clean editorial ── */
        .nll-article {
          min-width: 0;
          background: transparent;
        }

        /* ── Sidebar placeholder (keeps grid column) ── */
        .nll-placeholder { display: none; }
        @media(min-width:1024px){ .nll-placeholder { display: block; } }

        /* ── Sidebar stack ── */
        .nll-sidebar-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media(max-width:1023px){
          .nll-sidebar-stack { margin-top: 32px; }
        }
      `}</style>

      <div className="nll-wrap" ref={wrapRef}>

        {/* ── Article (left) ── */}
        <div className="nll-article">
          {article}
        </div>

        {/* ── Sidebar (right) ── */}
        {isDesktop ? (
          <>
            {/* Grid placeholder */}
            <div className="nll-placeholder" />

            {/* Archive — JS-pinned */}
            <div
              ref={archiveRef}
              style={{
                position: pinned ? "fixed" : "absolute",
                top:    pinned ? pinnedTop : pinnedTop > 0 ? pinnedTop : 0,
                left:   pinned ? pinnedLeft : undefined,
                right:  !pinned ? 0 : undefined,
                width:  pinnedWidth,
                zIndex: 20,
              }}
            >
              {archive}
            </div>

            {/* About — NOT pinned, sits below archive in normal flow */}
            <div
              ref={aboutRef}
              style={{
                position: "absolute",
                bottom: 80,
                right: 0,
                width: pinnedWidth,
                zIndex: 10,
              }}
            >
              {about}
            </div>
          </>
        ) : (
          /* Mobile: stacked */
          <div className="nll-sidebar-stack">
            <div ref={archiveRef}>{archive}</div>
            <div ref={aboutRef}>{about}</div>
          </div>
        )}

      </div>
    </>
  );
}
