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
      <section className="py-40 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-4xl md:text-6xl font-bold leading-tight text-gray-700">
            <span className="text-white">We believe in Transparency.</span> We don't hide behind jargon. Honest communication and clear goals.
            <span className="text-white"> We believe in Creativity.</span> Every brand is unique. We refuse to use cookie-cutter strategies.
            <span className="text-white"> We believe in Results.</span> Likes are vanity. Revenue is sanity.
            <span className="text-tpc-orange"> We focus on tangible growth.</span>
          </p>
        </div>
      </section>

      {/* 5. FOOTER CTA */}
      <section className="py-20 flex flex-col items-center text-center">
        <h3 className="text-2xl md:text-4xl font-bold mb-8 max-w-2xl">Ready to write history with us?</h3>
        <Link href="/contact">
          <button className="px-10 py-5 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-tpc-orange hover:scale-105 transition-all flex items-center gap-3">
            Start a Project <ArrowUpRight className="w-5 h-5" />
          </button>
        </Link>
      </section>

    </main>
  );
}