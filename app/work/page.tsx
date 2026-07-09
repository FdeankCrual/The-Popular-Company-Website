"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";

import { allProjects } from "../data/works";

function ProjectCard({ project, setSelectedVideo }: any) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (ref.current) {
      if (isHovered) {
        ref.current.play().catch(() => {});
      } else {
        ref.current.pause();
      }
    }
  }, [isHovered]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="break-inside-avoid relative group cursor-pointer rounded-2xl overflow-hidden bg-gray-900 border border-white/10"
      onClick={() => setSelectedVideo(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-full relative ${project.type === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'}`}>
        <video
          ref={ref}
          src={`${project.src}#t=0.001`}
          preload="metadata"
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 will-change-[transform,opacity] transform-gpu"
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
  );
}

export default function WorkPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<any>(null); // For the full-screen modal
  const [projects, setProjects] = useState<any[]>(allProjects);

  // URL to the published Google Sheet CSV
  // Instructions: Go to Google Sheets -> File -> Share -> Publish to web -> Choose 'Comma-separated values (.csv)' -> Paste link here.
  const googleSheetCSVUrl: string = "https://docs.google.com/spreadsheets/d/1I74kK__yQUlKL_JrbvkJIIGzc1GP8XD_04T1u72Byt4/export?format=csv";

  useEffect(() => {
    if (googleSheetCSVUrl && googleSheetCSVUrl.startsWith("http")) {
      Papa.parse(googleSheetCSVUrl, {
        download: true,
        header: true,
        complete: (results) => {
          const parsedData = results.data
            .filter((row: any) => row.title && row.src) // Ensure valid rows
            .map((row: any, index: number) => ({
              id: index + 100, // offset id
              title: row.title,
              category: row.category || "Reels",
              type: row.type || "vertical",
              src: row.src,
            }));
          
          if (parsedData.length > 0) {
            setProjects(parsedData);
          }
        },
        error: (error) => {
          console.error("Error fetching Google Sheet CSV:", error);
        }
      });
    }
  }, []);

  // Filter logic
  const categories = ["All", ...Array.from(new Set(projects.map(p => p.category)))];
  
  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black">
      <Cursor />
      <Header />

      {/* 1. HERO & FILTERS */}
      <section className="pt-32 px-6 md:px-12 pb-12 max-w-7xl mx-auto">
        {/* Work Category Toggle */}
        <div className="flex justify-center md:justify-start mb-8">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md relative">
            <Link 
              href="/work" 
              className="relative z-10 px-6 py-2 text-sm font-bold uppercase tracking-widest text-black"
            >
              <motion.div layoutId="work-toggle" className="absolute inset-0 bg-tpc-orange rounded-full -z-10" />
              Content Creation
            </Link>
            <Link 
              href="/work/web" 
              className="relative z-10 px-6 py-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              Web Development
            </Link>
          </div>
        </div>

        <h1 className="text-[12vw] md:text-[6vw] font-bold leading-none tracking-tighter mb-8 text-center md:text-left">
          SELECTED <span className="text-tpc-orange">WORK.</span>
        </h1>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start border-b border-white/10 pb-8 mb-8">
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
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} setSelectedVideo={setSelectedVideo} />
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