"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Linkedin, Lock } from "lucide-react";

// --- 1. YOUR SPECIFIC DATA ---
const team = [
  {
    name: "Takshita Bhardwaj",
    role: "Co-Founder & Executive Head",
    img: "/takshita1.png",
    linkedin: "https://www.linkedin.com/in/takshita-bhardwaj-a5385a209/",
    email: "thepopularco.official@gmail.com"
  },
  {
    name: "Dhruv Paneri",
    role: "Co-Founder & Editing Head",
    img: "/dhruv.png",
    linkedin: "https://www.linkedin.com/in/dhruv-paneri-a2b458163/",
    email: "thepopularco.official@gmail.com"
  },
  {
    name: "Garv Parihar",
    role: "Co-Founder & Content Head",
    img: "/garv.png",
    linkedin: "https://www.linkedin.com/in/garv-parihar-35176817b/",
    email: "thepopularco.official@gmail.com"
  },
  {
    name: "Bhavik Bhardwaj",
    role: "Co-Founder & Analytics Head",
    img: "/bhavik.png",
    linkedin: "https://www.linkedin.com/in/bhavik-bhardwaj-3b0b0a278/",
    email: "thepopularco.official@gmail.com"
  }
];

const isRedacted = (name: string) => name === "Garv Parihar";

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

      {/* --- 4. THE TEAM GRID --- */}
      <section className="px-6 md:px-12 pb-32">
        <h2 className="text-xs font-mono uppercase text-tpc-orange mb-10 tracking-widest">The Minds Behind TPC</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => {
            const locked = isRedacted(member.name);
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="group"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm mb-6 bg-neutral-900 border border-white/5">
                <Image
                  src={member.img}
                  alt={locked ? "Classified" : member.name}
                  fill
                  className={`object-cover transition-all duration-700 ease-out ${
                    locked 
                      ? "grayscale blur-xl brightness-50" 
                      : "grayscale group-hover:grayscale-0 group-hover:scale-105"
                  }`}
                />

                {/* Overlay */}
                {locked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <Lock className="w-12 h-12 text-white/40 mb-4" />
                     <div className="text-white/40 text-xs font-mono tracking-[0.3em] uppercase">Identity Classified</div>
                  </div>
                ) : (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-white border border-white/30 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-colors">
                      <span className="text-xs font-bold uppercase tracking-widest">Connect</span>
                      <Linkedin className="w-4 h-4" />
                    </div>
                  </a>
                )}
              </div>

              {/* Name & Role */}
              <div className="border-l-2 border-transparent group-hover:border-tpc-orange pl-0 group-hover:pl-4 transition-all duration-300">
                {locked ? (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-gray-500">
                      [ REDACTED ]
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm mt-1 font-mono tracking-widest">
                      CO-FOUNDER & ???????
                    </p>
                    <div className="text-gray-600 text-xs mt-1.5 font-mono">
                      ██████████████
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight">{member.name}</h3>
                    <p className="text-gray-500 text-xs md:text-sm mt-1 font-mono">{member.role}</p>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-gray-400/80 hover:text-tpc-orange text-xs mt-1.5 font-mono transition-colors block"
                    >
                      {member.email}
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          )})}
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