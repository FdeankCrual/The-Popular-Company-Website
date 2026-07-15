"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { allProjects as fallbackProjects } from "../data/works";
import { X, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface GallerySectionProps {
  onBack: () => void;
  projects?: any[];
}

type TrackDivider = { type: "divider"; id: string; title: string; subtitle: string };
type TrackArtwork = { type: "artwork"; id: string; data: any; group: string };
type TrackItem = TrackDivider | TrackArtwork;

const GOOGLE_SHEET_CSV = "https://docs.google.com/spreadsheets/d/16k1uBxpkebVWJBE7ZMkWQBhUFiDawOTys0PJGPBQqNQ/export?format=csv";

export default function GallerySection({ onBack, projects: initialProjects }: GallerySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // LIVE CMS STATE
  const [projects, setProjects] = useState<any[]>(initialProjects || fallbackProjects);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // MOBILE DETECTION FOR PERFORMANCE & NATIVE SCROLL
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // FETCH FROM GOOGLE SHEETS ON MOUNT (Only if not provided via SSR)
  useEffect(() => {
    if (initialProjects !== undefined) return;

    const fetchLiveCMS = async () => {
      try {
        const res = await fetch(GOOGLE_SHEET_CSV);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const text = await res.text();
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        
        // Parse CSV (Skip header row)
        const parsedData = lines.slice(1).map(line => {
          // Splitting by comma, assuming standard clean formatting
          const v = line.split(',');
          return {
            id: Number(v[0]),
            title: v[1] || "Untitled",
            category: v[2] || "Uncategorized",
            type: v[3] || "vertical",
            src: v[4] || "",
            link: v[5] || "#"
          };
        }).filter(w => w.src); // Must have a source video
        
        if (parsedData.length > 0) {
          setProjects(parsedData);
        }
      } catch (error) {
        console.error("Live CMS Fetch Error:", error);
      }
    };
    
    fetchLiveCMS();
  }, [initialProjects]);

  // Dynamically group the projects whenever the CMS data updates
  const galleryTrack = useMemo(() => {
    const uniqueCategories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    const track: TrackItem[] = [];
    
    uniqueCategories.forEach((cat, index) => {
      // Add a divider for the category
      track.push({ 
        type: "divider", 
        id: `div-${index}`, 
        title: String(cat).toUpperCase(), 
        subtitle: `Explore ${cat}` 
      });
      
      // Get projects in this category and add them as artworks
      const catProjects = projects.filter(w => w.category === cat);
      catProjects.forEach(w => {
        track.push({ 
          type: "artwork", 
          id: `art-${w.id}`, 
          data: w, 
          group: String(cat).toUpperCase() 
        });
      });
    });

    return track;
  }, [projects]);


  // Scroll mapping within the fixed container
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
  });

  // Smooth the scroll progress so horizontal pan feels buttery
  const smoothProgress = useSpring(scrollYProgress, { damping: 25, stiffness: 120, mass: 0.5 });

  // Map progress to horizontal translation
  const trackX = useTransform(smoothProgress, [0, 1], ["0%", "-100%"]);
  
  // The background text moves slower to create a deep parallax effect
  const bgTextX = useTransform(smoothProgress, [0, 1], ["0%", "-30%"]);

  // Auto-exit when scrolled to the very end
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 1.0 && !selectedId) {
      onBack();
    }
  });

  const selectedWork = projects.find((w) => w.id === selectedId);

  // ── MOBILE RENDER (NATIVE HORIZONTAL SCROLL) ──
  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-[100] bg-[#050505] overflow-hidden flex flex-col ${selectedId ? "pointer-events-none" : ""}`}>
        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-6 z-50 pointer-events-none">
          <button
            onClick={onBack}
            className="pointer-events-auto text-xs font-mono tracking-[0.2em] uppercase text-white hover:text-[#FF6B35] transition-colors flex items-center gap-2"
          >
            <span>←</span> EXIT
          </button>
        </div>

        {/* NATIVE SCROLL TRACK */}
        <div className="flex-1 w-full h-full overflow-x-auto overflow-y-hidden flex items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-x-contain">
          <div className="flex items-center px-6 gap-6 min-w-max h-full pointer-events-auto">
            
            {galleryTrack.map((item) => {
              if (item.type === "divider") {
                return (
                  <div key={item.id} className="flex flex-col justify-center pl-6 pr-12 flex-shrink-0 w-[85vw]">
                    <div className="w-12 h-1 bg-[#FF6B35] mb-6" />
                    <h2 className="text-5xl font-black text-white leading-none tracking-tighter uppercase mb-2">{item.title}</h2>
                    <p className="text-xs text-[#FF6B35] font-mono tracking-[0.2em] uppercase">{item.subtitle}</p>
                  </div>
                );
              }
              return (
                <div key={item.id} className="shrink-0 w-[75vw] sm:w-[60vw]">
                  <ArtworkCard 
                    work={item.data} 
                    group={item.group}
                    onExpand={setSelectedId} 
                    isMobile={true}
                  />
                </div>
              );
            })}

            {/* MOBILE EXIT CTA */}
            <div className="shrink-0 flex items-center justify-center px-12 w-[60vw]">
              <button onClick={onBack} className="flex flex-col items-center group">
                 <ArrowRight className="w-12 h-12 text-[#FF6B35] mb-4 group-hover:translate-x-2 transition-transform" />
                 <span className="text-[#FF6B35] font-mono text-xs uppercase tracking-widest text-center">Tap to Exit</span>
              </button>
            </div>
          </div>
        </div>

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {selectedId && selectedWork && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 pointer-events-auto">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md cursor-pointer"
              />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="relative bg-black rounded-lg overflow-hidden shadow-2xl z-10 w-full max-w-[420px] aspect-[9/16] border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

                <video src={selectedWork.src} autoPlay controls className="w-full h-full object-cover" />

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1">{selectedWork.title}</h3>
                </div>

                <Link href={selectedWork.link || "/work"} className="absolute bottom-6 right-6 z-30 pointer-events-auto">
                  <button className="px-5 py-2 bg-[#FF6B35] text-black text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-2">
                    View Case <ArrowUpRight className="w-3 h-3" />
                  </button>
                </Link>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── DESKTOP RENDER (800vh PARALLAX) ──
  return (
    <div 
      ref={scrollContainerRef} 
      className={`fixed inset-0 z-[100] bg-[#050505] overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${selectedId ? "overflow-y-hidden" : "overflow-y-auto"}`}
    >
      <div style={{ height: "800vh" }}>
        
        {/* Sticky Viewport */}
        <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center">
        
        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-10 z-50 pointer-events-none">
          <button
            onClick={onBack}
            className="pointer-events-auto text-xs font-mono tracking-[0.2em] uppercase text-white hover:text-[#FF6B35] transition-colors flex items-center gap-2"
          >
            <span>←</span> EXIT GALLERY
          </button>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 text-[9px] font-mono tracking-[0.3em] uppercase text-gray-500">
          Scroll vertically to pan horizontally
        </div>

        {/* ── PARALLAX BACKGROUND TEXT ── */}
        <motion.div 
          className="absolute inset-0 flex items-center pointer-events-none opacity-[0.15]"
          style={{ x: bgTextX }}
        >
          <div className="flex gap-[60vw] px-[20vw]">
            {["ACT", "CREATIVE", "AD", "BEYOND"].map((title, i) => (
              <h1 
                key={i} 
                className="text-[35vw] font-black leading-none text-transparent tracking-tighter"
                style={{ 
                  WebkitTextStroke: "2px #FF6B35",
                  fontFamily: "Impact, sans-serif" 
                }}
              >
                {title}
              </h1>
            ))}
          </div>
        </motion.div>

        {/* ── FOREGROUND FILM STRIP ── */}
        <motion.div 
          className="relative flex items-center pl-[20vw] pr-[20vw]"
          style={{ x: trackX }}
        >
          {galleryTrack.map((item) => {
            if (item.type === "divider") {
              return <TrackDivider key={item.id} title={item.title} subtitle={item.subtitle} />;
            }
            return (
              <ArtworkCard 
                key={item.id}
                work={item.data} 
                group={item.group}
                onExpand={setSelectedId} 
              />
            );
          })}

          {/* VIEW ALL WORKS - VERTICAL CTA */}
          <Link href="/work" className="pointer-events-auto flex-shrink-0 mr-[10vw] flex items-center justify-center h-[65vh]">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center justify-center h-[80%] px-8 rounded-full border-2 border-[#FF6B35]/30 hover:border-[#FF6B35] bg-black/40 backdrop-blur-md overflow-hidden group cursor-pointer shadow-[0_0_30px_rgba(255,107,53,0.1)] transition-colors duration-500"
            >
              {/* Hover Sweep Animation */}
              <div className="absolute inset-0 bg-[#FF6B35] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-700 ease-[0.76,0,0.24,1]" />
              
              <span 
                className="relative z-10 text-[#FF6B35] group-hover:text-black font-mono font-bold text-sm tracking-[0.4em] uppercase whitespace-nowrap transition-colors duration-500 flex items-center gap-8"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                View All Works <ArrowRight className="w-5 h-5" />
              </span>
            </motion.div>
          </Link>

          {/* AUTO-EXIT TRIGGER TEXT */}
          <div className="flex flex-col items-center justify-center min-w-[20vw]">
            <motion.div 
              animate={{ x: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-[#FF6B35]"
            >
              <ArrowRight className="w-16 h-16 opacity-80" />
            </motion.div>
            <p className="mt-8 text-xs text-[#FF6B35] font-mono tracking-[0.4em] uppercase text-center mb-8">
              Scroll more<br/>to exit
            </p>
          </div>
        </motion.div>

      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {selectedId && selectedWork && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-black rounded-lg overflow-hidden shadow-2xl z-10"
              style={{
                width: "min(90vw, 420px)",
                aspectRatio: "9/16",
                boxShadow: "0 0 100px rgba(255,107,53,0.15)",
                border: "1px solid rgba(255,107,53,0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-[#FF6B35] hover:text-black transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <video
                src={selectedWork.src}
                autoPlay
                controls
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
                  {selectedWork.title}
                </h3>
              </div>

              <Link
                href={selectedWork.link || "/work"}
                className="absolute bottom-8 right-8 z-30 pointer-events-auto"
              >
                <button className="px-6 py-3 bg-[#FF6B35] text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white transition-colors flex items-center gap-2 shadow-lg">
                  View Case <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

// ─── TRACK DIVIDER (CATEGORY HEADER) ───
function TrackDivider({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col justify-center px-[10vw] flex-shrink-0" style={{ width: "60vw" }}>
      <div className="w-16 h-1 bg-[#FF6B35] mb-8" />
      <h2 className="text-[5vw] font-black text-white leading-none tracking-tighter uppercase mb-4">
        {title}
      </h2>
      <p className="text-lg text-[#FF6B35] font-mono tracking-[0.3em] uppercase">
        {subtitle}
      </p>
    </div>
  );
}

// ─── ARTWORK CARD ───
function ArtworkCard({ work, group, onExpand, isMobile = false }: { work: any; group: string; onExpand: (id: number) => void; isMobile?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    
    let playTimeout: NodeJS.Timeout;

    if (hovered) {
      // Delay before playing (universal gap) to prevent accidental triggers while panning
      playTimeout = setTimeout(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = false; // Turn on audio
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // If browser blocks audio autoplay, fallback to muted
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          });
        }
      }, 400); // 400ms gap
    } else {
      videoRef.current.pause();
    }

    return () => clearTimeout(playTimeout);
  }, [hovered]);
  
  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onExpand(work.id)}
      className={`relative group cursor-pointer flex-shrink-0 ${isMobile ? 'mr-0' : 'mr-[8vw]'}`}
      animate={{ 
        scale: hovered && !isMobile ? 1.05 : 1,
        y: hovered && !isMobile ? -10 : 0
      }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      style={{
        // Viewport height relative sizing so it feels massive
        height: isMobile ? "60vh" : "65vh",
        aspectRatio: "9/16",
      }}
    >
      {/* Orange Glow Behind the Video - DISABLED ON MOBILE FOR PERFORMANCE */}
      {!isMobile && (
        <div 
          className="absolute inset-0 bg-[#FF6B35] rounded-xl blur-[60px] transition-opacity duration-500 pointer-events-none"
          style={{ opacity: hovered ? 0.4 : 0 }}
        />
      )}
      
      <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/5 bg-[#111]">
        <video
          ref={videoRef}
          src={`${work.src}#t=0.001`}
          preload="metadata"
          muted
          loop playsInline
          className="w-full h-full object-cover will-change-[filter]"
          style={{
            filter: (hovered || isMobile) ? "brightness(1) contrast(1.1)" : "brightness(0.5) grayscale(0.5)",
            transition: "filter 0.5s ease",
            transform: "translateZ(0)", // Force hardware acceleration
          }}
        />

        {/* Cinematic Title Overlay on Hover */}
        <div 
          className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end transition-opacity duration-500 pointer-events-none"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <h4 className="text-xl font-bold text-white uppercase tracking-tight">
            {work.title}
          </h4>
          <p className="text-[10px] text-[#FF6B35] font-mono tracking-[0.2em] uppercase mt-2">
            {group}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
