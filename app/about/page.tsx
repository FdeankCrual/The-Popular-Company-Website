"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";



// --- 2. COMPONENT: SCROLL REVEAL TEXT ---
const RevealText = ({ children }: { children: string }) => {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
};

export default function About() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"]
  });

  return (
    <main ref={container} className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black">
      <Cursor />
      <Header />

      {/* 1. HERO: THE STATEMENT */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32">

        {/* Date Tag */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-tpc-orange font-mono text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-tpc-orange rounded-full animate-pulse" />
            Since March 2024
          </motion.div>
        </div>

        <h1 className="text-[10vw] md:text-[8vw] font-bold leading-[0.9] tracking-tighter uppercase">
          <RevealText>We Don't Just</RevealText>
          <RevealText>Market.</RevealText>
          <span className="text-tpc-orange">
            <RevealText>We Move People.</RevealText>
          </span>
        </h1>

        <div className="mt-20 flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/20 pt-8 gap-8">
          <p className="max-w-2xl text-gray-400 text-lg md:text-xl leading-relaxed">
            The Popular Company was built on a simple promise: <span className="text-white font-bold">Quality over Quantity.</span> We are a team of creators, analysts, and strategists in Udaipur who believe that in a noisy world, only the unforgettable survive.
          </p>
          <ArrowDown className="animate-bounce w-6 h-6 text-tpc-orange hidden md:block" />
        </div>
      </section>

      {/* 2. THE MANIFESTO (SCROLLING TEXT) */}
      <section className="py-40 px-6 md:px-12 border-t border-white/10 relative">
        <div className="max-w-5xl mx-auto">
          <p className="text-4xl md:text-6xl font-bold leading-tight text-gray-700">
            <span className="text-white hover:text-tpc-orange transition-colors duration-500 cursor-default">We believe in Transparency.</span> We don't hide behind jargon. Honest communication and clear goals.
            <span className="text-white hover:text-tpc-orange transition-colors duration-500 cursor-default"> We believe in Creativity.</span> Every brand is unique. We refuse to use cookie-cutter strategies.
            <span className="text-white hover:text-tpc-orange transition-colors duration-500 cursor-default"> We believe in Results.</span> Likes are vanity. Revenue is sanity.
            <span className="text-tpc-orange"> We focus on tangible growth.</span>
          </p>
        </div>
      </section>

      {/* 3. OUR APPROACH */}
      <section className="px-6 md:px-12 pb-40 bg-tpc-black relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-tpc-orange/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

        <h2 className="text-xs font-mono uppercase text-tpc-orange mb-16 tracking-widest border-l-2 border-tpc-orange pl-4 max-w-6xl mx-auto">Our Approach</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 p-10 rounded-2xl hover:bg-white/10 transition-colors group"
          >
            <div className="text-4xl font-black text-white/20 mb-6 group-hover:text-tpc-orange transition-colors">01</div>
            <h3 className="text-2xl font-bold mb-4">Data-Driven Strategy</h3>
            <p className="text-gray-400 leading-relaxed">
              We don't rely on guesswork. Every campaign starts with deep market research, audience analysis, and identifying the exact gaps your brand can fill.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 p-10 rounded-2xl hover:bg-white/10 transition-colors group"
          >
            <div className="text-4xl font-black text-white/20 mb-6 group-hover:text-tpc-orange transition-colors">02</div>
            <h3 className="text-2xl font-bold mb-4">Creative Execution</h3>
            <p className="text-gray-400 leading-relaxed">
              Information tells, but stories sell. We craft striking visuals, engaging copy, and compelling narratives that capture attention in a crowded feed.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 p-10 rounded-2xl hover:bg-white/10 transition-colors group"
          >
            <div className="text-4xl font-black text-white/20 mb-6 group-hover:text-tpc-orange transition-colors">03</div>
            <h3 className="text-2xl font-bold mb-4">Relentless Scaling</h3>
            <p className="text-gray-400 leading-relaxed">
              Launch is just the beginning. We continuously monitor, A/B test, and optimize performance to ensure maximum ROI and sustainable long-term growth.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}