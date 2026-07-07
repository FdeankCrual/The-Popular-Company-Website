"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The loading sequence lasts 2.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Optional: Unlock scroll here if you locked it
      document.body.style.overflow = "auto";
    }, 2500);

    // Lock scroll while loading
    document.body.style.overflow = "hidden";

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-tpc-black"
          exit={{ y: "-100%" }} // The "Curtain" effect sliding up
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* LOGO ANIMATION CONTAINER */}
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            
            {/* The Logo Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: [0.8, 1.1, 1], // The "Heartbeat" pop
                rotate: [0, -5, 0]    // Slight tilt
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative w-full h-full"
            >
               <Image 
                 src="/logo.png" 
                 alt="Loading..." 
                 fill 
                 className="object-contain" 
                 priority 
               />
            </motion.div>

            {/* The "Loading" Progress Line below logo */}
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               transition={{ duration: 2, ease: "easeInOut" }}
               className="h-1 bg-tpc-orange mt-4 rounded-full mx-auto"
            />
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white text-center mt-2 text-[10px] uppercase tracking-[0.3em] font-bold"
            >
              Loading
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}