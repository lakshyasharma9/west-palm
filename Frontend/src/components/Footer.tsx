"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Phone, Mail,
  Linkedin, Youtube, Instagram, ArrowUpRight,
} from "lucide-react";
import { footerLinks, contactInfo, socialLinks, footerText } from "@/constants/footer";
import { iconBoxStyle } from "@/constants/styles";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#071f0a", color: "white", position: "relative", overflow: "hidden" }}>

      {/* Background glows */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(20,99,33,0.18) 0%, transparent 70%)",
        transform: "translate(30%, -30%)", pointerEvents: "none",
      }}/>
      <div style={{
        position: "absolute", bottom: 0, left: 0, width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)",
        transform: "translate(-30%, 30%)", pointerEvents: "none",
      }}/>

      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}/>

      {/* Gold top border */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)" }}/>

      <div className="section-container" style={{ position: "relative", zIndex: 10, paddingTop: "64px", paddingBottom: "0" }}>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{
          gap: "20px", paddingBottom: "44px",
          borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "44px",
        }}>
          <h2 style={{
            margin: 0, fontWeight: 700, lineHeight: 1.15,
            fontSize: "clamp(1.5rem, 4vw, 2.9rem)",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-heading)", color: "white",
          }}>
            {footerText.ctaHeading}{" "}
            <span style={{ color: "#D4AF37", whiteSpace: "nowrap" }}>{footerText.ctaHighlight}</span>
          </h2>

          <Link
            href="/contact"
            className="self-start sm:self-auto"
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "13px 24px", border: "1.5px solid #D4AF37", borderRadius: "8px",
              color: "#D4AF37", fontWeight: 600, fontSize: "0.9rem",
              textDecoration: "none", transition: "background 0.25s, color 0.25s",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#D4AF37";
              (e.currentTarget as HTMLElement).style.color = "#071f0a";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#D4AF37";
            }}
          >
            {footerText.ctaButton} <ArrowUpRight size={15}/>
          </Link>
        </div>

        {/* Main grid — 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "36px", marginBottom: "48px" }}>

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div style={{ marginBottom: "18px" }}>
              <Image
                src="/logo-white.png"
                alt="West Palm Construction Solutions"
                width={120} height={48}
                loading="lazy"
                unoptimized
                style={{ objectFit: "contain", objectPosition: "left" }}
              />
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.75, marginBottom: "24px", maxWidth: "300px" }}>
              {footerText.description}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[Linkedin, Youtube, Instagram].map((Icon, i) => (
                <a key={i} href={socialLinks[i].url} style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.6)", transition: "all 0.25s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "#146321";
                    (e.currentTarget as HTMLElement).style.borderColor = "#146321";
                    (e.currentTarget as HTMLElement).style.color = "white";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  <Icon size={14}/>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "20px" }}>
              Services
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "11px" }}>
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "20px" }}>
              Company
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "11px" }}>
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "white"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4AF37", marginBottom: "20px" }}>
              Get in Touch
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={iconBoxStyle}><MapPin size={13} color="#D4AF37"/></div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem", lineHeight: 1.5, paddingTop: "5px" }}>
                  {contactInfo.address}
                </span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={iconBoxStyle}><Phone size={13} color="#D4AF37"/></div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}>{contactInfo.phone}</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={iconBoxStyle}><Mail size={13} color="#D4AF37"/></div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}>{contactInfo.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{
          gap: "12px", borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "22px 0 28px", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)",
        }}>
          <p style={{ margin: 0, textAlign: "center" }}>
            &copy; {new Date().getFullYear()} {footerText.copyright}
          </p>
          <div className="flex justify-center" style={{ gap: "20px" }}>
            {footerText.legal.map((label) => (
              <a key={label} href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Design credit */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "16px 0 20px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          fontSize: "0.7rem", color: "rgba(255,255,255,0.3)",
        }}>
          <a href="https://tech4brand.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"}
          >
            <span>Design & Developed by</span>
            <Image src="/Profile.png" alt="Tech4Brand" width={18} height={18} style={{ borderRadius: "4px" }} />
            <span style={{ fontWeight: 600 }}>Tech4Brand</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
