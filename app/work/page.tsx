"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import { Play, X, Volume2, VolumeX } from "lucide-react";

// --- 1. YOUR DATA ---
// Add 'type' to categorize: "reel" (9:16) or "video" (16:9)
// Add 'category' for the filter buttons
const allProjects = [
  { 
    id: 1, 
    title: "Opal Stone", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/stone opal.mp4" 
  },
  { 
    id: 2, 
    title: "Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/triform1.mp4" 
  },
  { 
    id: 3, 
    title: "Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/triform2.mp4" 
  },
  { 
    id: 4, 
    title: "Astrology", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/tarot1.mp4" 
  },
  { 
    id: 5, 
    title: "Cleaning", 
    category: "Ads", 
    type: "horizontal", 
    src: "reels/dplus1.mp4" 
  },
  { 
    id: 6, 
    title: "Delivery", 
    category: "Ads", 
    type: "horizontal", 
    src: "reels/dplus2.mp4" 
  },
  { 
    id: 7, 
    title: "Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/triform3.mp4" 
  },
  { 
    id: 8, 
    title: "Astrology", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/tarot2.mp4" 
  },
  { 
    id: 9, 
    title: "Fitness", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/triform4.mp4" 
  },
  { 
    id: 10, 
    title: "Pyrite Stone", 
    category: "Reels", 
    type: "vertical", 
    src: "reels/stone pyrite.mp4" 
  },
  { 
    id: 11, 
    title: "Product Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/dplus 3.mp4" 
  },
  { 
    id: 12, 
    title: "Product Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/dplus4.mp4" 
  },
  { 
    id: 13, 
    title: "Product Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/dplus5.mp4" 
  },
  { 
    id: 14, 
    title: "Furniture Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/ledecus1.mp4" 
  },
  { 
    id: 15, 
    title: "Podcast intro...", 
    category: "Podcast", 
    type: "horizontal", 
    src: "reels/intro pod.mp4" 
  },
  { 
    id: 16, 
    title: "Furniture Ad", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/ledecus2.mp4" 
  },
  { 
    id: 17, 
    title: "Offer Promotion", 
    category: "Ads", 
    type: "vertical", 
    src: "reels/smacky1.mp4" 
  }
];

const categories = ["All", "Reels", "Ads", "Podcast"];

export default function WorkPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<any>(null); // For the full-screen modal

  // Filter logic
  const filteredProjects = activeFilter === "All" 
    ? allProjects 
    : allProjects.filter(p => p.category === activeFilter);

  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black">
      <Cursor />
      <Header />

      {/* 1. HERO & FILTERS */}
      <section className="pt-32 px-4 md:px-12 pb-12">
        <h1 className="text-[12vw] md:text-[6vw] font-bold leading-none tracking-tighter mb-8 text-center md:text-left">
          SELECTED <span className="text-tpc-orange">WORK.</span>
        </h1>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-full border transition-all text-sm md:text-base font-bold uppercase tracking-widest ${
                activeFilter === cat 
                ? "bg-white text-black border-white" 
                : "border-white/20 hover:border-tpc-orange hover:text-tpc-orange"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 2. THE MASONRY GRID */}
      <section className="px-4 md:px-12 pb-32">
        <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={project.id}
                className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden bg-gray-900 border border-white/10"
                onClick={() => setSelectedVideo(project)} // CLICK TO OPEN FULL SCREEN
              >
                {/* Video Preview (Muted loop) */}
                <div className={`w-full relative ${project.type === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                  <video
                    src={project.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  
                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                  <div className="absolute bottom-4 left-4 z-10">
                    <p className="text-xs font-bold text-tpc-orange uppercase tracking-widest mb-1">
                      {project.category}
                    </p>
                    <h3 className="text-xl font-bold">{project.title}</h3>
                  </div>

                  {/* Play Button Icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 duration-300">
                    <Play className="fill-white text-white w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 3. FULL SCREEN VIDEO MODAL (Fixes Aspect Ratio & Audio) */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedVideo(null)} // Click outside to close
          >
            {/* Close Button */}
            <button className="absolute top-6 right-6 text-white hover:text-tpc-orange z-50 p-2 bg-black/50 rounded-full">
              <X className="w-8 h-8" />
            </button>

            {/* The Video Player */}
            <div 
              className={`relative w-full max-h-full rounded-xl overflow-hidden shadow-2xl border border-white/10 ${
                selectedVideo.type === 'vertical' 
                  ? 'max-w-md aspect-[9/16]' // Vertical Phone Size
                  : 'max-w-5xl aspect-video' // Horizontal TV Size
              }`}
              onClick={(e) => e.stopPropagation()} // Don't close when clicking video
            >
              <video
                src={selectedVideo.src}
                autoPlay
                controls // Adds standard Play/Pause/Volume bar
                className="w-full h-full object-contain bg-black"
              />
            </div>
            
            <div className="absolute bottom-10 text-white text-center">
                <p className="text-sm text-gray-400 uppercase tracking-widest">Now Playing</p>
                <h2 className="text-2xl font-bold">{selectedVideo.title}</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}