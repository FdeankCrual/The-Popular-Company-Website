"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q: "How much do you charge for Social Media?", a: "Packages start from ₹20,000/mo depending on the number of reels, shoots, and ad management required." },
  { q: "Do you handle shoots outside Udaipur?", a: "Yes. While we are based in Udaipur, we travel across Rajasthan (Jaipur, Jodhpur) and India for campaign shoots." },
  { q: "Can you guarantee viral videos?", a: "No one can guarantee viral. But our 'High-Retention' editing formula gives your content the best mathematical chance of hitting the algorithm." },
  { q: "Do you work with small startups?", a: "Absolutely. We have specific 'Growth Starter' packages designed for new businesses looking to make a big impact." }
];

export default function FAQ() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 md:px-12 bg-white text-black rounded-3xl mx-4 md:mx-12 my-20">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">FAQ.</h2>
          <p className="text-gray-500">Common questions about working with TPC.</p>
        </div>

        <div className="md:w-2/3 flex flex-col">
          {faqs.map((item, i) => (
            <div key={i} className="border-b border-gray-200 py-6 cursor-pointer" onClick={() => setActive(active === i ? null : i)}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{item.q}</h3>
                {active === i ? <Minus className="text-tpc-orange" /> : <Plus />}
              </div>
              <AnimatePresence>
                {active === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-gray-600 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}