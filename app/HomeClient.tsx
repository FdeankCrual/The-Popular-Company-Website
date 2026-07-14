"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "./components/Header";
import Services from "./components/Services";
import ClientLogos from "./components/ClientLogos";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import HomePlaygroundTeaser from "./components/HomePlaygroundTeaser";
import HomeAuditTeaser from "./components/HomeAuditTeaser";

const Marquee = () => {
  return (
    <div className="w-full max-w-[100vw] overflow-hidden py-2 md:py-8 bg-tpc-orange text-black rotate-[-2deg] scale-110 border-y-2 md:border-y-4 border-black my-10 md:my-20 relative z-20">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      >
        {[...Array(8)].map((_, i) => (
          <h1 key={i} className="text-3xl md:text-7xl font-bold uppercase mr-8 md:mr-12">
            The Popular Company • 
          </h1>
        ))}
      </motion.div>
    </div>
  );
};

export default function HomeClient({ 
  workSection, 
  blogSection 
}: { 
  workSection: React.ReactNode, 
  blogSection: React.ReactNode 
}) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <main className="bg-tpc-black min-h-screen text-white overflow-x-clip selection:bg-tpc-orange selection:text-black"> 
      <Header />

      {/* 1. HERO */}
      <section className="min-h-screen flex flex-col justify-center px-4 md:px-12 pt-24 md:pt-20 relative">
        <motion.div style={{ y }} className="z-10 mt-10 md:mt-20">
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-[14vw] md:text-[15vw] leading-[0.9] font-bold tracking-tighter text-center md:text-left break-words"
          >
            WE MAKE <br />
            BRANDS <br />
            <span className="text-tpc-orange">POPULAR.</span>
          </motion.h1>
          
          <div className="mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-8">
            <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed text-center md:text-left">
              A digital agency in Udaipur that refuses to be boring.
            </p>
            <div className="animate-bounce text-tpc-orange text-sm uppercase tracking-widest">
               ↓ Scroll
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. LOGOS */}
      <ClientLogos />

      {/* 3. WORK PREVIEW (Injected Server Component) */}
      {workSection}

      {/* 4. SERVICES */}
      <Services />

      {/* 5. MARQUEE */}
      <Marquee />

      {/* 6. BLOG PREVIEW (Injected Server Component) */}
      {blogSection}

      {/* 6.5 AUDIT TEASER */}
      <HomeAuditTeaser />

      {/* 7. SOCIAL PROOF & FAQ */}
      <Testimonials />
      <HomePlaygroundTeaser />
      <FAQ />
    </main>
  );
}
