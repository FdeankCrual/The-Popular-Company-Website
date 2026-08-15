"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Target, TrendingUp } from "lucide-react";

export default function TrackRecordPage() {
  const containerRef = useRef(null);
  
  return (
    <main ref={containerRef} className="bg-tpc-black text-white selection:bg-tpc-orange selection:text-black">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-tpc-orange font-mono text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              Our Track Record
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.9] tracking-tighter uppercase mb-8">
              Built businesses to crores. <br/>
              <span className="text-tpc-orange">Now we help founders do the same.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-xl leading-relaxed mb-12">
              We've owned the P&L. We optimize the business, not just the ads.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-4 bg-tpc-orange text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform duration-300"
            >
              Work With Us <ArrowUpRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="w-full aspect-square md:aspect-auto md:h-[600px] border border-white/20 flex flex-col justify-between p-8 md:p-12 bg-tpc-black rounded-3xl relative overflow-hidden"
          >
            {/* Subtle grid pattern for texture without glowing AI vibes */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            
            <div className="flex justify-between items-start w-full relative z-10 text-gray-500 font-mono text-xs uppercase tracking-widest">
              <span>Est. 2024</span>
              <span>India</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
              <Image 
                src="/logo.png" 
                alt="TPC Logo" 
                width={160} 
                height={160} 
                className="object-contain"
              />
            </div>

            <div className="w-full relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
                The Popular <br/>Company
              </h2>
              <div className="w-full h-[1px] bg-white/10 my-6" />
              <div className="flex flex-wrap gap-4 justify-center">
                <span className="text-tpc-orange font-mono text-xs uppercase tracking-widest border border-tpc-orange/30 px-4 py-2 rounded-full">
                  Udaipur Based
                </span>
                <span className="text-tpc-orange font-mono text-xs uppercase tracking-widest border border-tpc-orange/30 px-4 py-2 rounded-full">
                  Global Scale
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* HERO STATS */}
        <div className="max-w-[1400px] mx-auto w-full mt-24 border-t border-white/20 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="text-5xl font-black text-tpc-orange mb-2">₹5.5Cr+</div>
              <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">revenue generated in the last 12 months</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="text-5xl font-black text-tpc-orange mb-2">40k+</div>
              <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">qualified leads generated</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="text-5xl font-black text-tpc-orange mb-2">2x</div>
              <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">average ROI across client campaigns</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. NOT JUST TRAFFIC SECTION */}
      <section className="py-32 px-6 md:px-12 border-t border-white/20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-sm font-mono text-tpc-orange uppercase tracking-[0.2em] mb-6">Not just driving traffic, we optimize the business.</h2>
          <h3 className="text-4xl md:text-6xl font-black mb-12 uppercase tracking-tighter">We've owned the P&L. <br/>We optimize the business.</h3>
          <p className="text-xl text-gray-400 leading-relaxed mb-12">
            When you hire an agency, you're outsourcing your growth to a team that hasn't run a business. We have. We understand what it takes to actually scale profitability, not just vanity metrics.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-4 border border-tpc-orange text-tpc-orange px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-tpc-orange hover:text-black transition-colors duration-300"
          >
            Work With Us
          </Link>
        </div>
      </section>

      {/* 3. CASE STUDIES & QUOTE */}
      <section className="py-32 px-6 md:px-12 border-t border-white/20">
        <div className="max-w-[1400px] mx-auto">
          <h3 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter">What happens when a <br/>founder runs your growth</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border border-white/20 rounded-3xl p-10 md:p-14"
            >
              <Target className="w-10 h-10 text-tpc-orange mb-6" />
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl md:text-5xl font-black text-gray-500">₹1.7L</div>
                <ArrowRight className="w-8 h-8 text-tpc-orange" />
                <div className="text-4xl md:text-5xl font-black text-tpc-orange">₹1.13Cr</div>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed">
                Our client was stuck at ₹1.7L a month. We came in, rebuilt their entire funnel, and scaled them to ₹1.13Cr.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="border border-white/20 rounded-3xl p-10 md:p-14"
            >
              <TrendingUp className="w-10 h-10 text-tpc-orange mb-6" />
              <div className="text-4xl md:text-5xl font-black text-tpc-orange mb-6">₹75L <span className="text-2xl text-gray-500 font-medium">in 4 months</span></div>
              <p className="text-gray-400 text-lg leading-relaxed">
                We helped a D2C brand scale from nothing to ₹75L in just 4 months through aggressive, systemized growth strategies.
              </p>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto text-center border-y border-white/20 py-16">
            <h4 className="text-3xl md:text-4xl font-bold leading-tight mb-8">
              "We run our team differently. There is zero fluff, zero vanity metrics. We track, we measure, and we make decisions based on what is going to make you the most money."
            </h4>
            <p className="text-tpc-orange font-mono uppercase tracking-widest text-sm">— The Popular Company</p>
          </div>
        </div>
      </section>

      {/* 4. MICRO STATS GRID */}
      <section className="py-32 px-6 md:px-12 border-t border-white/20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "BOOKMYPAINTING • OUR OWN COMPANY", stat: "0 ➔ ₹4Cr", desc: "International art e-commerce, bootstrapped from zero in 2016. Owned everything - growth, funnels, ads, and SEO pages that ranked #1-2 globally (some still top 3)." },
              { label: "SPEAKINENGLISH CLUB • OUR OWN COMPANY", stat: "₹1.5Cr", desc: "EdTech scaled via Meta Ads, funnels, and content. 1,521 purchases from the top campaign alone." },
              { label: "LIFESTYLE DROP-SHIPPING • META ADS", stat: "16–22× ROAS", desc: "Held across 57 campaigns - not one lucky ad, a repeatable system." },
              { label: "SPIRITUAL E-COMMERCE • META ADS", stat: "1,270 purchases", desc: "From the top campaign, at ₹799 AOV - volume economics done right." },
              { label: "SCHOOL ADMISSIONS • META LEAD GEN", stat: "7 schools • 565K+ reach", desc: "Education lead generation, repeated across seven schools." },
              { label: "FINANCE ASSOCIATION • META + GOOGLE + LINKEDIN", stat: "10.7M+ reach", desc: "Multi-platform institutional campaigns, reported to stakeholders." },
              { label: "HACK2SKILL • TECH & AI EVENTS • META ADS", stat: "75K+ registrations", desc: "Hackathons and AI events (India Runs, Build With AI) filled at as low as ₹7–16 per completed registration." },
              { label: "REAL ESTATE • META LEAD GEN", stat: "₹282–350 CPL", desc: "Controlled cost per lead at scale, across three developers." },
              { label: "YOUTUBE MUSIC CHANNEL • USA • PAID GROWTH", stat: "5M+ views • 136K subs", desc: "Built from scratch with paid campaigns - proof the playbook travels beyond Meta." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="border border-white/20 rounded-2xl p-8 flex flex-col hover:border-tpc-orange transition-colors"
              >
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">{item.label}</div>
                <div className="text-3xl md:text-4xl font-black text-tpc-orange mb-4 leading-tight">{item.stat}</div>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow">{item.desc}</p>
                <div className="text-tpc-orange font-bold text-xs uppercase tracking-[0.2em] mt-auto">
                  Proof +
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SYSTEMS DO */}
      <section className="py-32 px-6 md:px-12 border-t border-white/20">
        <div className="max-w-[1400px] mx-auto">
          <h3 className="text-5xl md:text-7xl font-black mb-20 tracking-tighter uppercase">
            Channels don't grow <br/> businesses. <span className="text-tpc-orange">Systems do.</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h4 className="text-2xl font-bold mb-4 text-tpc-orange">Our Approach</h4>
              <p className="text-gray-400">We focus on the entire business ecosystem, ensuring every piece of the puzzle works together to scale your revenue.</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-4 text-tpc-orange">Performance Marketing</h4>
              <p className="text-gray-400">We don't just run ads. We build customer acquisition systems that acquire customers profitably at scale.</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-4 text-tpc-orange">CRO</h4>
              <p className="text-gray-400">We optimize your landing pages and funnels to maximize conversion rates and drop your CAC.</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-4 text-tpc-orange">Retention</h4>
              <p className="text-gray-400">We build email flows and retention systems to maximize Lifetime Value (LTV) and bottom-line profit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GROWTH, LEARNED THE HARD WAY */}
      <section className="py-32 px-6 md:px-12 border-t border-white/20">
        <div className="max-w-[1400px] mx-auto">
          <h3 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter">Growth, learned the hard way</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <div className="text-4xl font-black text-tpc-orange mb-2">100+</div>
              <div className="text-sm uppercase tracking-widest text-gray-400 font-mono">Brands Scaled</div>
            </div>
            <div>
              <div className="text-4xl font-black text-tpc-orange mb-2">₹10Cr+</div>
              <div className="text-sm uppercase tracking-widest text-gray-400 font-mono">Ad Spend Managed</div>
            </div>
            <div>
              <div className="text-4xl font-black text-tpc-orange mb-2">5+</div>
              <div className="text-sm uppercase tracking-widest text-gray-400 font-mono">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-black text-tpc-orange mb-2">50+</div>
              <div className="text-sm uppercase tracking-widest text-gray-400 font-mono">Industries</div>
            </div>
          </div>

          <div className="relative h-[40vh] md:h-[60vh] w-full rounded-3xl overflow-hidden mb-16 border border-white/20 flex items-center justify-center bg-tpc-black">
             <Image 
               src="/team.png" 
               alt="TPC Growth Team" 
               fill 
               className="object-cover opacity-70 hover:opacity-100 transition-opacity duration-500" 
             />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/20 pt-16">
            <div>
              <h4 className="text-2xl font-bold mb-4 text-tpc-orange">What we do</h4>
              <p className="text-gray-400">We build high-performance growth systems for brands that want to dominate their market. No fluff, just scalable infrastructure.</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-4 text-tpc-orange">How we do it</h4>
              <p className="text-gray-400">Through relentless testing, aggressive optimization, and a deep understanding of unit economics and consumer psychology.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOUNDER QUESTIONS */}
      <section className="py-32 px-6 md:px-12 border-t border-white/20">
        <div className="max-w-[1000px] mx-auto">
          <h3 className="text-4xl md:text-5xl font-black mb-16 tracking-tighter text-center">The questions founders actually have</h3>
          
          <div className="space-y-12">
            <div className="border border-white/20 p-8 rounded-2xl">
              <h4 className="text-xl font-bold mb-3">"Are we getting quality leads or just trash?"</h4>
              <p className="text-gray-400">We optimize for bottom-line revenue and sales team feedback, not just CPL.</p>
            </div>
            <div className="border border-white/20 p-8 rounded-2xl">
              <h4 className="text-xl font-bold mb-3">"What happens if FB bans our ad account?"</h4>
              <p className="text-gray-400">We build robust, compliant systems with backup infrastructures ready to deploy immediately.</p>
            </div>
            <div className="border border-white/20 p-8 rounded-2xl">
              <h4 className="text-xl font-bold mb-3">"Can we push this to 10L a day?"</h4>
              <p className="text-gray-400">We implement advanced scaling protocols that maintain efficiency at high volume.</p>
            </div>
            <div className="border border-white/20 p-8 rounded-2xl">
              <h4 className="text-xl font-bold mb-3">"What if we have a sales team?"</h4>
              <p className="text-gray-400">We integrate directly with your CRM and train your setters to close the exact type of traffic we send.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER CTA */}
      <section className="py-40 px-6 md:px-12 bg-white text-black text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8">
            Your growth, with a founder's eyes on it.
          </h2>
          <p className="text-xl md:text-2xl font-medium mb-12 text-gray-600">
            Ready to scale? Book a call with us to see if we're a fit.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-4 bg-tpc-orange text-black px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform duration-300 shadow-xl"
          >
            Work With Us <ArrowUpRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

    </main>
  );
}
