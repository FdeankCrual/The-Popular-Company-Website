"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const services = [
  { title: "Social Media", id: "01" },
  { title: "Performance Ads", id: "02" },
  { title: "Video Production", id: "03" },
  { title: "Influencer Marketing", id: "04" },
  { title: "Web Development", id: "05" },
];

export default function Services() {
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-32 px-4 md:px-12 bg-white text-black rounded-3xl my-10 relative z-20">
      <div className="mb-12 md:mb-20 border-b border-gray-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <h2 className="text-5xl md:text-8xl font-bold tracking-tighter">
          WHAT <br /> WE DO
        </h2>
        <p className="max-w-sm text-gray-500 text-sm md:text-base">
          we engineer a digital presence that stops the scroll and makes your brand impossible to ignore.
        </p>
      </div>

      <div className="flex flex-col">
        {services.map((service, index) => (
          <Link 
            href={service.title === "Web Development" ? "/work/web" : "/services"}
            key={index}
            onMouseEnter={() => setHoveredService(index)}
            onMouseLeave={() => setHoveredService(null)}
            className="group flex flex-col md:flex-row justify-between items-start md:items-center py-8 md:py-16 border-b border-gray-200 cursor-pointer transition-all duration-300 md:hover:px-8"
            style={{ 
              // Only apply background color change on DESKTOP
              backgroundColor: (hoveredService === index && typeof window !== 'undefined' && window.innerWidth > 768) ? "#f8f8f8" : "transparent"
            }}
          >
            <span className="text-gray-400 text-sm md:text-xl font-mono mb-2 md:mb-0">
              /{service.id}
            </span>
            
            <h3 className="text-3xl md:text-6xl font-bold uppercase tracking-tight md:group-hover:translate-x-4 transition-transform duration-300">
              {service.title}
            </h3>

            <div className="hidden md:flex w-12 h-12 rounded-full border border-gray-300 items-center justify-center group-hover:bg-tpc-black group-hover:text-white transition-all">
               <ArrowUpRight className="w-5 h-5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}