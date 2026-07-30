"use client";
import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, User, ShieldCheck, Target, TrendingUp } from "lucide-react";

export default function MetaExpertPage() {
  const containerRef = useRef(null);
  
  return (
    <main ref={containerRef} className="bg-tpc-black text-white selection:bg-tpc-orange selection:text-black">
      <Cursor />
      <Header />

      {/* 1. HERO SECTION (Anonymous Identity) */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-tpc-orange/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 -translate-y-1/3" />
        
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-tpc-orange font-mono text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" /> Our Meta Ads Expert
            </p>
            <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase mb-8">
              The Engine Behind <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-tpc-orange to-white">The Growth.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-xl leading-relaxed mb-12">
              We protect our talent's identity, but their results are public. Built two businesses to crores. Now, we help founders do the same by optimizing the entire business, not just the ad account.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-[60vh] lg:h-[80vh] w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center group"
          >
            {/* Anonymous Identity Visual */}
            <div className="absolute inset-0 bg-gradient-to-t from-tpc-black via-tpc-orange/5 to-transparent z-10" />
            
            <div className="relative z-20 flex flex-col items-center justify-center text-center p-8">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20 relative overflow-hidden">
                <User className="w-16 h-16 md:w-24 md:h-24 text-white/30" />
                <div className="absolute inset-0 bg-tpc-orange/20 animate-pulse mix-blend-overlay" />
              </div>
              <p className="text-white font-mono uppercase tracking-widest text-lg md:text-xl font-bold mb-2">Lead Growth Strategist</p>
              <p className="text-tpc-orange font-mono text-sm uppercase tracking-widest bg-tpc-orange/10 px-4 py-2 rounded-full border border-tpc-orange/20">
                Identity Protected
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. SCALE & GROWTH PORTFOLIO */}
      <section className="py-32 px-6 md:px-12 border-t border-white/5 bg-tpc-black relative">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-24">
            <h2 className="text-sm font-mono text-tpc-orange uppercase tracking-[0.2em] mb-4">Case Studies</h2>
            <h3 className="text-4xl md:text-6xl font-black">What happens when founders <br/> run your growth.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-10 md:p-14 hover:bg-white/10 transition-colors"
            >
              <Target className="w-12 h-12 text-tpc-orange mb-8" />
              <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
                <div className="text-4xl md:text-6xl font-black text-gray-500">₹1.7L</div>
                <div className="w-12 h-[2px] bg-tpc-orange" />
                <div className="text-4xl md:text-6xl font-black text-tpc-orange">₹1.13Cr</div>
              </div>
              <h4 className="text-2xl font-bold mb-4">Scale & Predictability</h4>
              <p className="text-gray-400 text-lg leading-relaxed">
                From initial experimental ad spends to massive, scalable revenue engines in a matter of months. We build systems that allow for predictable, exponential growth without breaking acquisition costs.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-3xl p-10 md:p-14 hover:bg-white/10 transition-colors"
            >
              <TrendingUp className="w-12 h-12 text-tpc-orange mb-8" />
              <div className="mb-8 border-b border-white/10 pb-8">
                <div className="text-4xl md:text-6xl font-black text-tpc-orange mb-2">₹75L+</div>
                <div className="text-xl font-mono text-gray-500 uppercase tracking-widest">In Just 4 Months</div>
              </div>
              <h4 className="text-2xl font-bold mb-4">Speed to Market</h4>
              <p className="text-gray-400 text-lg leading-relaxed">
                Rapid deployment and optimization of sales funnels that capture high-intent audiences and convert them into paying clients. Time is money, and our execution speed reflects that.
              </p>
            </motion.div>
          </div>

          {/* 8-BOX MICRO STATS GRID */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: "2.4+ ROAS", desc: "For a competitive D2C brand scaling past 10L/month ad spend." },
              { stat: "1.1+ Cr", desc: "Revenue generated in the very first quarter of engagement." },
              { stat: "35.12+ ROAS", desc: "Achieved during a high-ticket luxury real estate launch campaign." },
              { stat: "1.27+ Cr", desc: "Generated strictly through advanced retention and retargeting systems." },
              { stat: "24.5+ ROAS", desc: "For an edtech brand selling high-ticket cohort-based courses." },
              { stat: "50.15L+", desc: "Profitable ad spend managed and scaled in a single calendar month." },
              { stat: "300%", desc: "Growth in qualified leads for a B2B SaaS while simultaneously lowering CAC." },
              { stat: "₹50L+ MRR", desc: "Milestone hit for a subscription brand by optimizing the funnel." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className="text-3xl font-black text-tpc-orange mb-3">{item.stat}</div>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. THE PHILOSOPHY (GIANT TEXT) */}
      <section className="min-h-[80vh] flex items-center justify-center px-6 md:px-12 bg-tpc-orange text-black relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-[1400px] mx-auto text-center"
        >
          <h2 className="text-[9vw] md:text-[7vw] font-black uppercase tracking-tighter leading-[0.9]">
            "Channels don't <br/> grow businesses.
            <br/> 
            <span className="text-white">Systems do."</span>
          </h2>
        </motion.div>
      </section>

      {/* 4. FOUNDER QUESTIONS */}
      <section className="py-32 px-6 md:px-12 bg-tpc-black relative border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h4 className="text-5xl md:text-6xl font-black leading-tight mb-8">Growth, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">learned the hard way.</span></h4>
              <p className="text-gray-400 text-xl md:text-2xl leading-relaxed mb-12 font-light">
                When founders run your growth, you stop worrying about vanity metrics like CTRs and start focusing on what matters: <strong className="text-white">Revenue, Margins, and Scale.</strong>
              </p>
              <div className="flex gap-4 items-center border border-white/10 bg-white/5 p-6 md:p-8 rounded-2xl inline-flex w-full">
                <div className="w-12 h-[2px] bg-tpc-orange shrink-0" />
                <p className="text-white font-bold uppercase tracking-widest text-sm md:text-lg">Your growth, with a founder's eyes on it.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-[30px] p-10 md:p-14 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-tpc-orange/5 rounded-full blur-[100px]" />
              <h5 className="text-2xl font-bold mb-12 relative z-10 text-tpc-orange">The questions founders actually have:</h5>
              <ul className="space-y-10 relative z-10">
                <li className="flex items-start gap-6">
                  <div className="w-3 h-3 rounded-full bg-tpc-orange mt-2 shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.6)]" />
                  <div>
                    <h6 className="text-xl font-bold mb-3">"Are we getting quality leads or just trash?"</h6>
                    <p className="text-gray-400">We optimize for bottom-line revenue and sales team feedback, not just CPL.</p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-3 h-3 rounded-full bg-tpc-orange mt-2 shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.6)]" />
                  <div>
                    <h6 className="text-xl font-bold mb-3">"What happens if our ad accounts get banned?"</h6>
                    <p className="text-gray-400">We build robust, compliant systems with backup infrastructures ready to deploy immediately.</p>
                  </div>
                </li>
                <li className="flex items-start gap-6">
                  <div className="w-3 h-3 rounded-full bg-tpc-orange mt-2 shrink-0 shadow-[0_0_15px_rgba(255,107,0,0.6)]" />
                  <div>
                    <h6 className="text-xl font-bold mb-3">"Can we push our daily spend to ₹10L without breaking CPA?"</h6>
                    <p className="text-gray-400">We implement advanced scaling protocols that maintain efficiency at high volume.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 px-6 md:px-12 bg-tpc-black border-t border-white/10 text-center flex flex-col items-center justify-center">
        <h2 className="text-[8vw] md:text-[6vw] font-black tracking-tighter leading-none mb-8 uppercase text-white">
          Ready to scale?
        </h2>
        <p className="text-xl md:text-3xl max-w-2xl font-light mb-12 text-gray-400">
          Stop blending in. Let's build a digital presence that dominates your industry.
        </p>
        <Link
          href="/contact"
          className="flex items-center gap-4 bg-tpc-orange text-black px-10 py-6 rounded-full font-black uppercase tracking-[0.2em] hover:scale-110 transition-transform duration-300 shadow-2xl mx-auto"
        >
          Initiate Protocol <ArrowUpRight className="w-6 h-6" />
        </Link>
      </section>
    </main>
  );
}
