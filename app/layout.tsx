import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google"; // <--- 1. NEW IMPORT
import "./globals.css";
import Footer from "./components/Footer";
import Preloader from "./components/Preloader";

import Cursor from "./Cursor";

const inter = Inter({ subsets: ["latin"] });

// --- SEO METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL('https://thepopularcompany.com'),
  title: {
    default: "TPC | The Popular Company", 
    template: "%s | TPC", 
  },
  description: "Elite Social Media, Influencer Marketing, Performance Ads, and Web Development.",
  keywords: ["Social Media Agency", "Viral Content", "Web Design", "Marketing", "Udaipur", "TPC"],
  openGraph: {
    title: "The Popular Company | Digital Dominance",
    description: "We don't just post. We build audiences. Elite digital marketing agency.",
    url: "https://thepopularcompany.com", 
    siteName: "The Popular Company",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "The Popular Company - Digital Dominance",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Popular Company",
    description: "Elite Digital Marketing & Web Development",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-tpc-black`}
        suppressHydrationWarning={true}
      >
        <Cursor />
        <Preloader />
        {children}
        <Footer />

        
        <GoogleAnalytics gaId="G-MVWQMT9SR3" />
      </body>
    </html>
  );
}