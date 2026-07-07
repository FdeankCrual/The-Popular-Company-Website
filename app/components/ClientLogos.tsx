"use client";
import { motion } from "framer-motion";

const logos = [
  "D+ Shaandar", "My Ratna", "Triform Fitness", "Aacharya Dhankunver Nagar", 
  "Dr. Neeta Trivedi"
];

export default function ClientLogos() {
  return (
    <section className="py-10 bg-tpc-black border-y border-white/10 overflow-hidden relative z-10">
      <p className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">
        Trusted by 50+ Brands and Influencers in Rajasthan
      </p>
      
      <div className="flex">
        <motion.div 
          className="flex gap-12 md:gap-24 whitespace-nowrap px-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {/* We repeat the list twice to create a seamless loop */}
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <h3 key={i} className="text-xl md:text-3xl font-bold text-gray-400 opacity-50 uppercase tracking-tight hover:opacity-100 hover:text-white transition-opacity cursor-default">
              {logo}
            </h3>
          ))}
        </motion.div>
      </div>
    </section>
  );
}