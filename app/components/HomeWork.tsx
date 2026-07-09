"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MontageCover from "./MontageCover";
import GallerySection from "./GallerySection";

export default function HomeWork() {
  const [showGallery, setShowGallery] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleEnterGallery = () => {
    setIsTransitioning(true);
    
    // Switch to gallery while screen is fully covered by the black panel
    setTimeout(() => {
      setShowGallery(true);
      // Snap the container to the top of the viewport so the gallery is perfectly aligned
      wrapperRef.current?.scrollIntoView({ behavior: "instant" });
    }, 800);
    
    // Trigger the exit sweep
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const handleExitGallery = () => {
    if (isTransitioning) return; // Prevent double trigger
    setIsTransitioning(true);
    
    setTimeout(() => {
      setShowGallery(false);
      // Wait a tiny bit for React to unmount the 800vh gallery and remount MontageCover, 
      // then snap back to MontageCover
      setTimeout(() => {
        wrapperRef.current?.scrollIntoView({ behavior: "instant" });
      }, 50);
    }, 800);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  return (
    <div ref={wrapperRef} className="relative w-full bg-[#000]">
      
      {/* ── PHASE 1: Montage Intro ── */}
      {!showGallery && (
        <MontageCover onEnterGallery={handleEnterGallery} />
      )}

      {/* ── PHASE 2: Gallery Interior ── */}
      {showGallery && (
        <GallerySection onBack={handleExitGallery} />
      )}

      {/* ── CINEMATIC MULTI-LAYER SWIPE TRANSITION ── */}
      <AnimatePresence>
        {isTransitioning && (
          <>
            {/* Layer 1: Orange Sweep */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 z-[200] bg-[#FF6B35] pointer-events-none"
            />
            {/* Layer 2: Deep Black Sweep */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
              className="fixed inset-0 z-[201] bg-[#050505] pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

    </div>
  );
}