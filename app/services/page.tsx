"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

const services = [
  {
    id: "social-media",
    number: "01",
    title: "Social Media & Content",
    subtitle: "We don't just post. We build audiences.",
    description: "In a world of infinite scrolling, average content is completely invisible. We engineer viral moments and build sustainable digital communities around your brand. We conduct deep market research to find exactly what your audience craves, then produce high-end, native content designed specifically for the algorithms of Instagram, TikTok, and LinkedIn.",
    features: ["End-to-End Account Management", "Viral-First Content Creation", "Trend Research & Strategy", "Community Engagement", "High-End Video Production", "Analytics & Growth Tracking"],
    theme: "dark" // Dark section
  },
  {
    id: "influencer-marketing",
    number: "02",
    title: "Influencer Marketing",
    subtitle: "People trust people, not ads.",
    description: "We connect your brand with the right creators to drive authentic engagement, build social proof, and convert followers into customers. We manage the entire lifecycle of an influencer campaign. From finding the perfect brand match to negotiating rates and ensuring deliverables are met on time, we make influencer marketing seamless and highly profitable.",
    features: ["Influencer Identification & Outreach", "Campaign Strategy & Ideation", "Contract & Deliverable Management", "UGC (User Generated Content)", "Macro & Micro Influencer Tiers", "ROI & Conversion Tracking"],
    theme: "light" // Light section
  },
  {
    id: "performance-ads",
    number: "03",
    title: "Performance Ads",
    subtitle: "Stop guessing with your ad spend.",
    description: "We engineer data-driven paid campaigns across Meta, Google, and LinkedIn that generate highly qualified leads and predictable revenue. We don't just run ads; we build conversion engines. By combining creative that converts with hyper-targeted audience segments, we ensure every dollar you spend delivers a measurable return on investment.",
    features: ["Meta Ads (Facebook & Instagram)", "Google Search & Display Ads", "LinkedIn B2B Lead Gen", "A/B Testing & Optimization", "Custom Audience Retargeting", "Conversion Rate Optimization (CRO)"],
    theme: "dark"
  },
  {
    id: "web-development",
    number: "04",
    title: "Web Development",
    subtitle: "Your ultimate digital salesperson.",
    description: "We design and develop premium, high-performance web experiences that captivate users and drive massive conversions. We don't use generic templates. Every line of code is written to ensure your website is blazingly fast, fully accessible, and visually stunning. From cinematic scroll animations to complex backend systems, we build the internet's best websites.",
    features: ["Custom Next.js & React Applications", "High-Performance SSR", "E-Commerce & Shopify Integration", "Interactive 3D & WebGL Animations", "SEO & Technical Optimization", "Headless CMS Solutions"],
    theme: "light"
  }
];

export default function ServicesMasterPage() {
  const containerRef = useRef(null);

  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black" ref={containerRef}>
      <Cursor />
      <Header />

      {/* SUPER HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-tpc-orange font-mono text-sm md:text-base uppercase tracking-[0.2em] mb-6">
            Our Arsenal
          </p>
          <h1 className="text-[15vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter uppercase mb-10">
            DIGITAL <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">DOMINANCE.</span>
          </h1>
          <p className="text-xl md:text-3xl text-gray-400 max-w-3xl leading-relaxed font-light">
            We don't do "everything." We do the four things that actually grow revenue and build massive influence in the modern digital landscape. Scroll to explore our core pillars.
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-6 md:left-12 flex flex-col items-center gap-4"
        >
          <div className="w-[1px] h-24 bg-gradient-to-b from-tpc-orange to-transparent" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-tpc-orange rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Scroll
          </span>
        </motion.div>
      </section>

      {/* THE SERVICES SCROLL JOURNEY */}
      <div className="relative w-full">
        {services.map((service, index) => (
          <section
            key={service.id}
            id={service.id}
            className={`min-h-screen py-32 px-6 md:px-12 relative ${service.theme === 'light' ? 'bg-white text-black' : 'bg-tpc-black text-white border-t border-white/10'
              }`}
          >
            <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-32 h-full">

              {/* STICKY HEADER COLUMN */}
              <div className="lg:w-1/3 relative">
                <div className="lg:sticky lg:top-40">
                  <span className={`font-mono text-xl md:text-2xl block mb-4 ${service.theme === 'light' ? 'text-gray-400' : 'text-tpc-orange'}`}>
                    /{service.number}
                  </span>
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                    {service.title}
                  </h2>
                  <p className={`text-xl md:text-2xl font-bold uppercase tracking-wide ${service.theme === 'light' ? 'text-tpc-orange' : 'text-white'}`}>
                    {service.subtitle}
                  </p>
                </div>
              </div>

              {/* CONTENT COLUMN */}
              <div className="lg:w-2/3 flex flex-col justify-center">

                <p className={`text-2xl md:text-4xl font-light leading-relaxed mb-16 ${service.theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  {service.description}
                </p>

                {/* THE "WHAT YOU GET" LIST */}
                <div className="mb-16">
                  <h3 className={`font-mono text-sm uppercase tracking-[0.2em] mb-8 pb-4 border-b ${service.theme === 'light' ? 'border-gray-200 text-gray-500' : 'border-white/20 text-gray-400'}`}>
                    What we execute
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${service.theme === 'light' ? 'text-tpc-orange' : 'text-white'}`} />
                        <span className="text-lg md:text-xl font-bold uppercase tracking-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA FOR SPECIFIC SERVICE */}
                <div>
                  <Link
                    href={service.id === "web-development" ? "/work/web" : "/contact"}
                    className={`inline-flex items-center gap-4 px-8 py-5 rounded-full font-bold uppercase tracking-widest text-sm transition-all hover:scale-105 ${service.theme === 'light'
                        ? 'bg-black text-white hover:bg-tpc-orange'
                        : 'bg-white text-black hover:bg-tpc-orange hover:text-white'
                      }`}
                  >
                    {service.id === "web-development" ? "View Portfolio" : "Initiate Protocol"} <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </div>

              </div>
            </div>
          </section>
        ))}
      </div>

      {/* FINAL MASTER CTA */}
      <section className="py-40 px-6 md:px-12 bg-tpc-orange text-black text-center flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-[10vw] md:text-[8vw] font-black tracking-tighter leading-none mb-10 uppercase">
          Ready to scale?
        </h2>
        <p className="text-xl md:text-3xl max-w-2xl font-light mb-12">
          Stop blending in. Let's build a digital presence that dominates your industry.
        </p>
        <Link
          href="/contact"
          className="flex items-center gap-4 bg-black text-white px-10 py-6 rounded-full font-black uppercase tracking-[0.2em] hover:scale-110 transition-transform duration-300 shadow-2xl"
        >
          Start a Project <ArrowUpRight className="w-6 h-6" />
        </Link>
      </section>

    </main>
  );
}