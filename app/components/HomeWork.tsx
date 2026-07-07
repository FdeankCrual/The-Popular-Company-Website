"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { works } from "../data/works";
import { ArrowUpRight, Play, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Link from "next/link";

export default function HomeWork() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedWork = works.find((w) => w.id === selectedId);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Scroll handler for custom buttons
  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = direction === "left" ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-neutral-900 text-white relative z-10 overflow-hidden border-t border-white/5">
      
      {/* 1. HEADER SECTION */}
      <div className="px-6 md:px-12 mb-10 flex justify-between items-end">
        <div>
          <span className="text-tpc-orange font-mono text-xs uppercase tracking-widest block mb-2">
            Portfolio
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            SELECTED <span className="text-gray-500">PROJECTS.</span>
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex gap-4">
            <button onClick={() => scroll("left")} className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-colors">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll("right")} className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-colors">
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* 2. CINEMATIC SLIDER (Horizontal Scroll) */}
      {/* Aspect Ratio 16:9 looks much more premium on desktop */}
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto gap-6 px-6 md:px-12 pb-12 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing"
      >
        {works.map((work) => (
          <motion.div
            layoutId={`card-${work.id}`}
            key={work.id}
            onClick={() => setSelectedId(work.id)}
            className="relative flex-shrink-0 w-[85vw] md:w-[600px] aspect-video rounded-2xl overflow-hidden cursor-pointer group snap-center border border-white/10 bg-black"
          >
            {/* Image / Video Preview */}
            <div className="absolute inset-0">
               {/* NOTE: Ideally, you use a <video> here that autoplays on hover. 
                  For now, we use the image with a hover zoom effect.
               */}
               <img 
                  src={work.image} 
                  alt={work.client} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
               />
            </div>

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

            {/* Center Play Button (Only visible on hover/group-hover) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <Maximize2 className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Info Labels */}
            <div className="absolute bottom-6 left-6 z-20">
                <h3 className="text-2xl font-bold uppercase tracking-tight text-white mb-1">{work.client}</h3>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-tpc-orange rounded-full" />
                    <p className="text-xs text-gray-300 font-mono uppercase tracking-widest">{work.category}</p>
                </div>
            </div>
          </motion.div>
        ))}

        {/* 'View All' End Card */}
        <Link 
            href="/work"
            className="relative flex-shrink-0 w-[40vw] md:w-[300px] aspect-video rounded-2xl overflow-hidden cursor-pointer snap-center border border-white/10 bg-white/5 flex flex-col items-center justify-center group hover:bg-white/10 transition-colors"
        >
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-black">
                <ArrowUpRight className="w-5 h-5 text-tpc-orange" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">View All Works</span>
        </Link>
      </div>

      {/* 3. THE CINEMATIC POP-OUT MODAL */}
      <AnimatePresence>
        {selectedId && selectedWork && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="absolute inset-0 bg-black/95 backdrop-blur-lg"
            />

            {/* The Expanded Player */}
            <motion.div 
                layoutId={`card-${selectedId}`}
                className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
            >
                {/* Close Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                    className="absolute top-6 right-6 z-30 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-tpc-orange hover:text-black transition-colors border border-white/10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Video Player Area */}
                <div className="w-full h-full relative group">
                     {/* Use Video if available, else Image */}
                     {/* @ts-ignore */}
                     {selectedWork.video ? (
                         <video 
                            src={selectedWork.video} 
                            poster={selectedWork.image}
                            autoPlay 
                            controls
                            className="w-full h-full object-contain bg-black"
                         />
                     ) : (
                         <img 
                            src={selectedWork.image} 
                            alt={selectedWork.client}
                            className="w-full h-full object-cover"
                         />
                     )}

                     {/* Overlay Controls / Info */}
                     <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black to-transparent flex justify-between items-end pointer-events-none">
                         <div>
                             <h2 className="text-3xl font-bold text-white uppercase mb-2">{selectedWork.client}</h2>
                             <p className="text-sm text-gray-300 font-mono">{selectedWork.category}</p>
                         </div>
                         
                         <Link href={selectedWork.link} className="pointer-events-auto">
                            <button className="px-8 py-3 bg-tpc-orange text-black font-bold uppercase tracking-widest rounded-full hover:bg-white transition-colors flex items-center gap-2">
                                Full Case Study <ArrowUpRight className="w-4 h-4" />
                            </button>
                         </Link>
                     </div>
                </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}