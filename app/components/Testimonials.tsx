"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const reviews = [
  {
    id: 1,
    client: "Rishab Jain",
    company: "Triform Fitness Gym",
    text: "TPC has completely transformed how people see Triform online! From viral reels to content that resonates with fitness lovers, their team gets it right—every time."
  },
  {
    id: 2,
    client: "Acharya Dhankunver Nagar",
    company: "Astrologer",
    text: "The way they present my tarot readings and astrology insights is magical. My content feels authentic, yet trend-savvy—and that’s why my followers have grown steadily. People wait for my reels."
  },
  {
    id: 3,
    client: "Rukhsana Sabunwala",
    company: "D+ Shaandar",
    text: "TPC turns even cleaning hacks into binge-worthy stories. Our reels are now getting shared in hundreds, and our brand visibility has skyrocketed! Their creativity and strategy are just… shandaar."
  },
  {
    id: 4,
    client: "Manish Jain",
    company: "MyRatna",
    text: "they always get ahead of my expectations."
  },
  {
    id: 5,
    client: "Dr. Neeta Trivedi",
    company: "Numreologist, Akashic Record Reader",
    text: "TPC has brought a divine spark to my Instagram!"
  }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % reviews.length);
  const prev = () => setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <section className="py-20 px-6 md:px-12 bg-tpc-black relative z-10">
      <div className="max-w-4xl mx-auto">
        <Quote className="text-tpc-orange w-12 h-12 mb-8 opacity-50" />
        
        <div className="h-[250px] md:h-[200px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <h3 className="text-xl md:text-3xl font-medium leading-relaxed mb-6">
                "{reviews[index].text}"
              </h3>
              <div>
                <p className="font-bold text-white">{reviews[index].client}</p>
                <p className="text-tpc-orange text-sm uppercase tracking-widest">{reviews[index].company}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button onClick={prev} className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors"><ArrowLeft /></button>
          <button onClick={next} className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors"><ArrowRight /></button>
        </div>
      </div>
    </section>
  );
}