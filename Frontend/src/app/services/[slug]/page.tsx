import React from 'react';
import Link from 'next/link';

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center px-6" style={{ paddingTop: '100px' }}>
      <div className="max-w-3xl text-center glass rounded-3xl p-12 shadow-sm border border-[#146321]/10">
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#146321]/10 text-[#146321] font-bold tracking-wider uppercase mb-6 text-sm">
          Service Detail
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1E293B] mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-[#475569] text-lg leading-relaxed mb-10">
          We are currently crafting detailed insights for our <strong className="text-[#146321]">{title}</strong> service workflow. Please check back soon or contact our team for immediate assistance.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/services"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-[#146321] text-[#146321] px-8 py-3 rounded-full font-semibold hover:bg-[#146321] hover:text-white transition-all duration-300"
          >
            &larr; Back to Services
          </Link>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#1E293B] px-8 py-3 rounded-full font-semibold hover:bg-[#b8941f] transition-all duration-300 shadow-md"
          >
            Contact Us &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
