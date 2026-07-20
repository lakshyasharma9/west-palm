"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/constants/navigation";

export default function Navbar() {
  const [isScrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const lastYRef = { current: window.scrollY };
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const curr = window.scrollY;
          setScrolled(curr > 50);
          
          if (curr < 50) {
            setHidden(false);
          } else if (curr > lastYRef.current + 5) {
            setHidden(true);  // scrolling down
          } else if (curr < lastYRef.current - 5) {
            setHidden(false); // scrolling up
          }
          
          lastYRef.current = curr;
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "transform 0.4s ease, background-color 0.5s ease, box-shadow 0.5s ease",
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        backgroundColor: isScrolled ? "rgba(10, 59, 18, 0.95)" : "rgba(255, 255, 255, 0.97)",
        backdropFilter: isScrolled ? "blur(24px)" : "blur(8px)",
        WebkitBackdropFilter: isScrolled ? "blur(24px)" : "blur(8px)",
        boxShadow: isScrolled ? "0 4px 32px rgba(0,0,0,0.25)" : "0 1px 0 rgba(0,0,0,0.06)",
        padding: "20px 0",
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div style={{ position: "relative", width: 90, height: 90, transition: "all 0.3s ease", flexShrink: 0, marginLeft: "clamp(0px, 3vw, 40px)", background: "transparent" }}>
            <Image
              src="/West_Palm_Logo-removebg-preview.png"
              alt="WPCS Logo"
              fill
              sizes="90px"
              loading="eager"
              className="object-contain"
              priority
              unoptimized
              style={{ opacity: isScrolled ? 0 : 1, transition: "opacity 0.5s ease", position: "absolute", background: "transparent" }}
            />
            <Image
              src="/logo-white.png"
              alt="WPCS Logo"
              fill
              sizes="90px"
              loading="eager"
              className="object-contain"
              priority
              unoptimized
              style={{ opacity: isScrolled ? 1 : 0, transition: "opacity 0.5s ease", position: "absolute", background: "transparent" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
           
           
          </div>
        </Link>

        <div className="hidden lg:flex items-center" style={{ gap: "40px" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isScrolled ? "scrolled" : ""} ${pathname === link.href ? "active" : ""}`}
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                transition: "color 0.3s ease",
                color: isScrolled
                  ? (pathname === link.href ? "#D4AF37" : "rgba(255,255,255,0.9)")
                  : (pathname === link.href ? "#146321" : "#475569"),
              }}
              onMouseEnter={e => {
                if (pathname !== link.href)
                  (e.currentTarget as HTMLElement).style.color = isScrolled ? "#ffffff" : "#146321";
              }}
              onMouseLeave={e => {
                if (pathname !== link.href)
                  (e.currentTarget as HTMLElement).style.color = isScrolled ? "rgba(255,255,255,0.9)" : "#475569";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4" style={{ marginRight: "20px" }}>
          <div className="hidden lg:block">
            <Link
              href="/contact"
              aria-label="Get a quote for your construction project"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 32px",
                backgroundColor: isScrolled ? "#D4AF37" : "#146321",
                color: isScrolled ? "#0A3B12" : "#ffffff",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "0.875rem",
                letterSpacing: "0.02em",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
              }}
            >
              Get a Quote
            </Link>
          </div>
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="lg:hidden p-2"
            style={{ color: isScrolled ? "#ffffff" : "#1E293B" }}
            aria-label="Toggle navigation menu"
            aria-expanded={navOpen}
          >
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <div
        style={{
          overflow: "hidden",
          transition: "max-height 0.5s ease, opacity 0.5s ease",
          maxHeight: navOpen ? "400px" : "0px",
          opacity: navOpen ? 1 : 0,
        }}
        className="lg:hidden"
      >
        <div
          style={{
            margin: "8px 16px 0",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            backgroundColor: isScrolled ? "rgba(10, 59, 18, 0.97)" : "rgba(255,255,255,0.98)",
            border: isScrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(20,99,33,0.1)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: "0.95rem",
                fontWeight: 500,
                padding: "10px 0",
                borderBottom: isScrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(20,99,33,0.08)",
                color: isScrolled
                  ? (pathname === link.href ? "#D4AF37" : "rgba(255,255,255,0.85)")
                  : (pathname === link.href ? "#146321" : "#475569"),
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            style={{
              marginTop: "12px",
              textAlign: "center",
              padding: "12px",
              backgroundColor: isScrolled ? "#D4AF37" : "#146321",
              color: isScrolled ? "#0A3B12" : "#ffffff",
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            Get a Quote
          </Link>
        </div>
      </div>
    </header>
  );
}
