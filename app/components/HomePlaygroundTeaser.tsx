"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Lock, ArrowRight } from "lucide-react";

export default function HomePlaygroundTeaser() {
  return (
    <section className="py-20 px-4 md:px-12 bg-tpc-black relative overflow-hidden">
      
      {/* 1. THE CONTAINER (Looks like a confidential file) */}
      <Link href="/playground">
        <motion.div 
            whileHover={{ scale: 0.98 }}
            className="w-full max-w-5xl mx-auto bg-[#111] border border-red-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden group cursor-pointer"
        >
            
            {/* 2. BACKGROUND SCROLLING WARNING (The "Tape" Effect) */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex flex-col gap-8 rotate-12 scale-150">
                <div className="flex gap-4 animate-marquee">
                    {[...Array(20)].map((_, i) => (
                        <span key={i} className="text-4xl font-black uppercase text-red-500 whitespace-nowrap">
                            RESTRICTED AREA //
                        </span>
                    ))}
                </div>
                <div className="flex gap-4 animate-marquee-reverse">
                    {[...Array(20)].map((_, i) => (
                        <span key={i} className="text-4xl font-black uppercase text-red-500 whitespace-nowrap">
                            AUTHORIZED PERSONNEL ONLY //
                        </span>
                    ))}
                </div>
            </div>

            {/* 3. CONTENT */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                
                {/* Left Side: The "Secret" Vibe */}
                <div className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/50 rounded-full text-red-500 text-[10px] font-bold uppercase tracking-widest w-fit mx-auto md:mx-0 animate-pulse">
                        <Lock className="w-3 h-3" /> Top Secret
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-white">
                        Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-tpc-orange">TPC Labs</span>
                    </h2>
                    
                    <p className="text-gray-400 max-w-md">
                        We built a secret casino for creators. Generate viral ideas, fix your hooks, and calculate your millions.
                    </p>
                </div>

                {/* Right Side: The "Button" */}
                <div className="flex flex-col items-center gap-2">
                    <button className="w-16 h-16 rounded-full bg-red-500 text-black flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                        <ArrowRight className="w-8 h-8 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </button>
                    <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Enter at own risk
                    </span>
                </div>

            </div>

            {/* 4. HOVER GLITCH OVERLAY */}
            <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            
        </motion.div>
      </Link>

    </section>
  );
}