import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import LoaderWrapper from "@/components/LoaderWrapper";
import NavigationLoader from "@/components/NavigationLoader";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollManager from "@/components/ScrollManager";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wpcs.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "West Palm Construction Solutions | Pioneer in Construction Technology",
  description:
    "WPCS delivers cutting-edge construction technology solutions including BIM Modeling, VDC Coordination, Quantity Take-Off, Prefabrication, 3D Rendering, and 4D Scheduling.",
  keywords:
    "construction technology, BIM modeling, VDC coordination, quantity takeoff, prefabrication, 3D rendering, 4D scheduling, West Palm Construction",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "WPCS - Pioneer in Construction Technology",
    description:
      "Cutting-edge construction technology solutions for the modern builder.",
    type: "website",
    url: siteUrl,
    siteName: "West Palm Construction Solutions",
  },
  twitter: {
    card: 'summary_large_image',
    title: "WPCS - Pioneer in Construction Technology",
    description: "Cutting-edge construction technology solutions for the modern builder.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'West Palm Construction Solutions',
    url: siteUrl,
    logo: `${siteUrl}/logo-white.png`,
    description: 'Pioneer in Construction Technology - BIM, VDC, and Digital Fabrication Solutions',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-561-555-0123',
      contactType: 'customer service',
      email: 'projects@wpcs.com',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1200 Lakeview Avenue, Suite 400',
      addressLocality: 'West Palm Beach',
      addressRegion: 'FL',
      postalCode: '33401',
      addressCountry: 'US',
    },
    sameAs: [
      'https://www.linkedin.com/company/89331237',
      'https://www.youtube.com/@WestPalmConsultants',
    ],
  };

  return (
    <html lang="en" className="antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col" suppressHydrationWarning>
        <Script id="scroll-restoration" strategy="beforeInteractive">
          {`
            if ('scrollRestoration' in history) {
              history.scrollRestoration = 'manual';
            }
            window.scrollTo(0, 0);
          `}
        </Script>
        <ScrollManager />
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <SmoothScroll />
        <LoaderWrapper />
        <NavigationLoader />
        <Navbar />
        <PageTransition>
          <main id="main-content" className="flex-1">{children}</main>
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
