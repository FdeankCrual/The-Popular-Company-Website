import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google"; // <--- 1. NEW IMPORT
import "./globals.css";
import Footer from "./components/Footer";
import Preloader from "./components/Preloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- SEO METADATA ---
export const metadata: Metadata = {
  title: {
    default: "TPC | The Popular Company", 
    template: "%s | TPC", 
  },
  description: "We build viral social media strategies, high-end content, and digital experiences for brands that want to dominate the feed.",
  keywords: ["Social Media Agency", "Viral Content", "Web Design", "Marketing", "Udaipur", "TPC"],
  openGraph: {
    title: "TPC | The Popular Company",
    description: "Dominating the feed with viral strategies and high-end content.",
    url: "https://thepopularcompany.com", 
    siteName: "TPC",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "TPC - The Popular Company",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TPC | The Popular Company",
    description: "We build viral social media strategies.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-tpc-black`}
      >
        <Preloader />
        {children}
        <Footer />
        
        {/* <--- 2. YOUR ANALYTICS CODE IS HERE */}
        <GoogleAnalytics gaId="G-MVWQMT9SR3" />
      </body>
    </html>
  );
}