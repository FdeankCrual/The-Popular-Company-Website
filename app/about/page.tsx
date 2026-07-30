"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import Image from "next/image";
import { ArrowDown, Code, PenTool, TrendingUp, Zap, Target, Globe } from "lucide-react";

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
    <main ref={container} className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black overflow-x-hidden">
      <Cursor />
      <Header />

      {/* 1. HERO: THE STATEMENT */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-tpc-orange/5 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        {/* Date Tag */}
        <div className="mb-6 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-tpc-orange font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-3 border border-tpc-orange/20 inline-flex px-4 py-2 rounded-full bg-tpc-orange/5"
          >
            <span className="w-2 h-2 bg-tpc-orange rounded-full animate-pulse" />
            Established 2024 • Udaipur
          </motion.div>
        </div>

        <h1 className="text-[12vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter uppercase relative z-10 mix-blend-difference">
          <RevealText>We Don't Just</RevealText>
          <RevealText>Market.</RevealText>
          <span className="text-tpc-orange">
            <RevealText>We Move People.</RevealText>
          </span>
        </h1>

        <div className="mt-20 flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/10 pt-12 gap-8 relative z-10 max-w-[1400px]">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-3xl text-gray-400 text-xl md:text-3xl font-light leading-relaxed"
          >
            The Popular Company was built on a simple premise: <span className="text-white font-bold">Quality over Quantity.</span> We are a collective of creators, analysts, and strategists who believe that in a noisy world, <span className="text-tpc-orange italic">only the unforgettable survive.</span>
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="animate-bounce flex items-center justify-center w-16 h-16 rounded-full border border-white/20 shrink-0"
          >
            <ArrowDown className="w-6 h-6 text-tpc-orange" />
          </motion.div>
        </div>
      </section>

      {/* 2. MASONRY VIBE GRID */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7 bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group h-[300px] md:h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tpc-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 font-mono uppercase tracking-widest">[Culture / Office Image 1]</span>
            </div>
          </motion.div>
          <div className="md:col-span-5 grid grid-rows-2 gap-6 h-[600px] md:h-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-tpc-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 font-mono uppercase tracking-widest">[Team Image 2]</span>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-tpc-orange text-black rounded-3xl overflow-hidden relative group flex flex-col justify-center p-10"
            >
              <Globe className="w-12 h-12 mb-6 opacity-50" />
              <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none mb-4">Udaipur Based.</h3>
              <h3 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none text-black/50">Global Reach.</h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. THE MANIFESTO */}
      <section className="py-40 px-6 md:px-12 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-[2px] bg-tpc-orange" />
            <h2 className="text-sm font-mono uppercase text-tpc-orange tracking-[0.2em]">Our Manifesto</h2>
          </div>
          <p className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tighter text-gray-700 uppercase">
            <span className="text-white hover:text-tpc-orange transition-colors duration-500 cursor-default">We believe in Transparency.</span> We don't hide behind jargon. 
            <span className="text-white hover:text-tpc-orange transition-colors duration-500 cursor-default"> We believe in Creativity.</span> We refuse to use cookie-cutter strategies.
            <span className="text-white hover:text-tpc-orange transition-colors duration-500 cursor-default"> We believe in Results.</span> Likes are vanity. Revenue is sanity.
            <span className="text-tpc-orange block mt-12 border-l-8 border-tpc-orange pl-8">We focus on tangible growth.</span>
          </p>
        </div>
      </section>

      {/* 4. THE ECOSYSTEM */}
      <section className="py-40 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[1000px] h-[1000px] bg-tpc-orange/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-[2px] bg-tpc-orange" />
                <h2 className="text-sm font-mono uppercase text-tpc-orange tracking-[0.2em]">The TPC Ecosystem</h2>
              </div>
              <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">How We Build<br/><span className="text-gray-500">Brands.</span></h3>
            </div>
            <p className="text-gray-400 max-w-md text-lg leading-relaxed">
              We don't just offer services; we build interconnected systems that compound your growth over time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Data-Driven Strategy", desc: "Every campaign starts with deep market research and identifying exact gaps your brand can fill." },
              { icon: PenTool, title: "Creative Execution", desc: "Information tells, but stories sell. We craft striking visuals and compelling narratives." },
              { icon: Zap, title: "Performance Ads", desc: "Optimizing the entire business ecosystem for maximum return on ad spend." },
              { icon: Code, title: "Digital Experiences", desc: "Building high-converting landing pages and websites that feel as premium as your product." },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-tpc-orange transition-all duration-300">
                  <item.icon className="w-8 h-8 text-white group-hover:text-black transition-colors" />
                </div>
                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                <p className="text-gray-400 leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}