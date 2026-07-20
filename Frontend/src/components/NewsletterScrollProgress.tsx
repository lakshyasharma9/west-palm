"use client";

import { useEffect, useState } from "react";

export default function NewsletterScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setPct(Math.min(100, Math.max(0,
        (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      )));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, height:"3px",
      zIndex:99999, background:"rgba(20,99,33,0.10)", pointerEvents:"none",
    }}>
      <div style={{
        height:"100%", background:"#146321",
        width:`${pct}%`,
        transition:"width 150ms ease-out",
        borderRadius:"0 2px 2px 0",
      }} />
    </div>
  );
}
