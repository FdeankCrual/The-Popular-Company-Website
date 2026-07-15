"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center flex-col">
      <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4">
        <motion.div
          animate={{ 
            scale: [0.8, 1.1, 0.8],
            rotate: [0, -5, 0]
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
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
      </div>
      <div className="mt-2 w-32 md:w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-tpc-orange"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
