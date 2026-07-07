"use client";
import Link from "next/link";
import { Instagram, Linkedin, Twitter, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-black pt-20 pb-10 px-6 md:px-12 rounded-t-[3rem] mt-[-2rem] relative z-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section: CTA and Logo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10">
          <div>
            <h2 className="text-[12vw] md:text-[6vw] font-bold leading-none tracking-tighter mb-6">
              LET'S TALK.
            </h2>
            <Link href="/contact">
              <button className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-tpc-orange hover:scale-105 transition-all flex items-center gap-2">
                Start a Project <ArrowUpRight />
              </button>
            </Link>
          </div>
          
          <div className="text-right hidden md:block">
            <h3 className="text-2xl font-bold mb-2">The Popular Company</h3>
            <p className="text-gray-500">Udaipur, Rajasthan, India</p>
            <a href="mailto:thepopularco.official@gmail.com" className="text-xl font-bold hover:text-tpc-orange transition-colors block mt-2">
              thepopularco.official@gmail.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 mb-10"></div>

        {/* Bottom Section: Links & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-bold uppercase tracking-widest text-gray-500">
          
          <div className="flex gap-6">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/work" className="hover:text-black">Work</Link>
            <Link href="/services" className="hover:text-black">Services</Link>
            <Link href="/about" className="hover:text-black">About</Link>
          </div>

          <div className="flex gap-4">
             <a href="https://www.instagram.com/thepopularcompany_?igsh=ZGczc3V6OThqMWdq" className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
             <a href="https://www.linkedin.com/company/107515857" className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
             <a href="#" className="p-2 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
          </div>

          <div>
            © {currentYear} TPC. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}