"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center flex-col">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
          TPC<span className="text-tpc-orange">.</span>
        </h1>
      </motion.div>
      <div className="mt-6 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
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
