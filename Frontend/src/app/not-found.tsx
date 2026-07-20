import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found | WPCS',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[120px] md:text-[180px] font-bold text-[#146321] leading-none">
            404
          </h1>
          <div className="h-1 w-24 bg-[#D4AF37] mx-auto mb-6"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1E293B]">
          Page Not Found
        </h2>
        
        <p className="text-lg text-[#475569] mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#146321] text-white rounded-full font-semibold hover:bg-[#0A3B12] transition-all duration-300 hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return Home
        </Link>
      </div>
    </div>
  );
}
