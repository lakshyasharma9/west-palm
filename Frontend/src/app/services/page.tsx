"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Building2,
  Fullscreen,
  Workflow,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import MagneticButton from "@/components/MagneticButton";
import { services as allServices } from "@/data/services";

const CONTAINER = "w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-16";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF8] relative">
      {/* hero */}
      <section className="relative w-full h-screen max-h-[1080px] min-h-[600px] overflow-hidden flex flex-col justify-center items-center text-center z-10">
        <style>{`
          @keyframes smoothZoom {
            0%   { transform: scale(1);    }
            45%  { transform: scale(1.15); }
            75%  { transform: scale(1.22); }
            100% { transform: scale(1);    }
          }
          .animate-smoothZoom {
            animation: smoothZoom 25s ease-in-out infinite;
            will-change: transform;
          }
        `}</style>

        <div className="absolute inset-0 z-[-1]">
          <div
            className="w-full h-full bg-cover bg-center animate-smoothZoom origin-center"
            style={{ backgroundImage: 'url("/services/pic22.jpg")' }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div
          className="relative z-20 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto"
          style={{ marginTop: "40px" }}
        >
          <h1
            className="drop-shadow-lg text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.2]"
            style={{ color: "#D4AF37", marginBottom: "28px" }}
          >
            Elevating Construction <br className="hidden md:block" />
            Standards,{" "}
            <span
              className="text-white font-serif italic font-medium"
              style={{ fontFamily: "Georgia, serif" }}
            >
              One Project at a Time
            </span>
          </h1>

          <p
            className="text-white drop-shadow-md text-sm md:text-base font-normal max-w-2xl leading-relaxed opacity-90"
            style={{ marginBottom: "36px" }}
          >
            From precision BIM modeling to full-scale VDC coordination, we offer
            a comprehensive suite of professional construction technology
            services.
          </p>

          <MagneticButton
            href="/contact"
            variant="primary"
            className="!bg-[#D4AF37] hover:!bg-[#146321] transition-colors duration-500 !border-none !px-8 !py-4 !text-lg !text-white flex items-center justify-center"
          >
            <span className="flex items-center gap-2 font-semibold tracking-wide">
              Contact Us
              <ArrowUpRight size={22} className="stroke-[2.5px]" />
            </span>
          </MagneticButton>
        </div>
      </section>

      {/* services grid */}
      <section
        className="relative bg-[#F8FAF8] z-10 w-full"
        style={{
          paddingTop: "clamp(80px, 10vh, 130px)",
          paddingBottom: "clamp(80px, 10vh, 130px)",
        }}
      >
        <div className="section-container">


          <div className="mb-20 md:mb-28" style={{marginBottom:"50px"}}>
            <span className="block text-sm font-semibold text-[#146321] mb-3 uppercase tracking-widest">
              [Our Services]
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl text-[#146321] leading-[1.1] font-sans font-medium tracking-tight" style={{color:"#146321", marginBottom: "120px"}}>
              Browse All Our{" "}
              <span
                className="font-serif italic font-medium tracking-normal text-black"
                style={{ fontFamily: "Georgia, serif" , color:"#D4AF37" , marginBottom: "90px"} }
              >
                Services
              </span>
            </h2>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20 md:gap-x-10 md:gap-y-24">
            {allServices.map((svc, i) => (
              <div key={i} className="flex flex-col group/card transition-all duration-500">

                <div className="relative w-full overflow-hidden mb-6 aspect-[4/3.5] rounded-[24px] bg-[#f8f9fa]" style={{marginBottom:"20px"}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={svc.image}
                    alt={svc.title}
                    className="w-full h-full object-contain transition-transform duration-1000 ease-out group-hover/card:scale-105"
                  />
                </div>


                <h3 className="font-medium text-[#146321] mb-6 text-2xl leading-snug transition-colors duration-500" style={{marginBottom:"20px"}}>
                  {svc.title}
                </h3>


                <p className="text-[#146321] text-[1rem] leading-relaxed mb-10 flex-grow transition-colors duration-500"style={{marginBottom:"20px"}}>
                  {svc.description}
                </p>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how we work */}
      <section
        className="relative bg-white overflow-hidden z-10 w-full"
        style={{
          paddingTop: "clamp(10px, 12vh, 150px)",
          paddingBottom: "clamp(100px, 12vh, 150px)",
          
        }}
      >
        <div className="section-container relative z-10">


          <div className="flex flex-col items-center text-center mb-20 md:mb-28" style={{marginBottom:"30px"}}>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#146321]/10 border border-[#146321]/20 text-xs font-bold text-[#146321] tracking-[0.15em] uppercase mb-8" style={{marginBottom:"30px"}}>
              Our Process
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-8 text-[#1E293B] leading-[1.15]"style={{marginBottom:"30px"}}>
              How We <span className="text-[#146321]">Work</span>
            </h2>
            <p className="text-base md:text-lg text-[#475569] max-w-3xl leading-relaxed">
              A streamlined, technology-driven process from initial consultation
              to final data handover, ensuring total project success.
            </p>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12" style={{marginTop:"30px"}}>
            {[
              {
                icon: <Fullscreen size={40} className="text-[#146321] group-hover:text-white transition-colors" />,
                title: "Discovery",
                desc: "Understanding project goals and technical requirements through an in-depth deep dive.",
              },
              {
                icon: <Workflow size={32} className="text-[#146321] group-hover:text-white transition-colors" />,
                title: "Strategy",
                desc: "Developing a custom and robust BIM Execution Plan (BEP) tailored to your project.",
              },
              {
                icon: <Building2 size={32} className="text-[#146321] group-hover:text-white transition-colors" />,
                title: "Execution",
                desc: "High-precision modeling, clash detection, and rigorous multi-trade coordination.",
              },
              {
                icon: <CheckCircle2 size={32} className="text-[#146321] group-hover:text-white transition-colors" />,
                title: "Delivery",
                desc: "Final quality checks and seamless native data handover to your team.",
              },
            ].map((step, i) => (
              <div key={i} className="group flex flex-col h-full" >
                <div className="bg-white border border-[#146321]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl rounded-3xl p-10 lg:p-12 text-center flex flex-col items-center h-full transition-all duration-500 hover:-translate-y-2" style={{ minHeight: '280px' }}>
                  <div className="w-24 h-24 shrink-0 rounded-full bg-[#146321]/5 border border-[#146321]/10 flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-[#146321] transition-all duration-500" style={{marginBottom:"30px", marginTop:"10px"}}>
                    {step.icon}
                  </div>
                  <h4 className="font-bold text-xl md:text-2xl text-[#1E293B] mb-5 leading-tight"style={{marginBottom:"10px"}}>
                    {step.title}
                  </h4>
                  <p className="text-base text-[#64748B] leading-relaxed flex-grow">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* contact parallax */}
      <section className="relative w-full h-screen overflow-hidden">

        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/services/const.jpg")',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>


        <div className="relative z-10 h-full flex items-center">
          <div className="section-container w-full">
            <div className="max-w-3xl">
              <span className="inline-block text-sm font-semibold text-[#D4AF37] tracking-widest uppercase mb-6">
                [Get in Touch]
              </span>
              
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-[1.1]" style={{ color: '#ffffff', textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 10px rgba(0,0,0,0.3)' }}>
                Ready to Get{" "}
                <span className="font-serif italic" style={{ fontFamily: "Georgia, serif", color: '#ffffff' }}>
                  Started
                </span>
              </h2>
              
              <p className="text-white/90 text-lg md:text-xl leading-relaxed max-w-2xl" style={{ marginBottom: '40px' }}>
                Let our expert team handle the hard work while you enjoy a beautiful project. Get in touch today for a free quote!
              </p>

              <MagneticButton
                href="/contact"
                variant="primary"
                className="group/btn !bg-white hover:!bg-[#146321] transition-all duration-500 ease-in-out !border !border-[#146321]/10 !py-3 !px-3 !pl-8 inline-flex flex-row items-center gap-3 shadow-sm hover:shadow-[0_8px_30px_rgba(20,99,33,0.3)] !rounded-full"
                style={{ display: 'inline-flex', alignItems: 'center', flexDirection: 'row' }}
              >
                <span className="font-semibold text-[#1E293B] group-hover/btn:text-white transition-all duration-500 ease-in-out text-[1.1rem]" style={{ whiteSpace: 'nowrap', lineHeight: '1' }}>
                  Contact Us
                </span>
                <span className="shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out bg-[#146321] group-hover/btn:bg-white" style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white group-hover/btn:text-[#146321] transition-all duration-500 ease-in-out group-hover/btn:rotate-45"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </span>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
