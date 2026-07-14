"use client";
import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function Header() {
  const [isActive, setIsActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [workMenuOpen, setWorkMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // 1. Detect Scroll Position
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Work", href: "/work" },
    { name: "Services", href: "/services" },
    { name: "Blogs", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "Playground", href: "/playground" }
  ];

  const menuVariants = {
    open: { y: "0%", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const } },
    closed: { y: "-100%", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const} }
  };

  return (
    <>
      {/* =======================================
          STATE A: THE "GRAND ENTRANCE" (Top of Page)
          Visible only when NOT scrolled
         ======================================= */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, pointerEvents: "none" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-8 flex justify-between items-center text-white mix-blend-difference pointer-events-auto"
          >
            {/* Big Logo */}
            <Link href="/" className="hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="TPC" width={60} height={60} className="w-14 h-14 object-contain" priority />
            </Link>

            {/* Big Menu Text */}
            <button 
              onClick={() => setIsActive(true)}
              className="text-lg font-bold uppercase tracking-widest hover:text-tpc-orange transition-colors flex items-center gap-3 group"
            >
              <div className="w-2 h-2 bg-white rounded-full group-hover:bg-tpc-orange transition-colors" />
              Menu
            </button>
          </motion.nav>
        )}
      </AnimatePresence>


      {/* =======================================
          STATE B: THE "MISSION CONTROL" DOCK (Scrolled)
          Drops down when user scrolls past 100px
         ======================================= */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-4 pr-2 shadow-2xl pointer-events-auto">
              
              {/* 1. Mini Logo */}
              <Link href="/" className="hover:opacity-70 transition-opacity">
                <Image src="/logo.png" alt="TPC" width={30} height={30} className="w-8 h-8 object-contain" />
              </Link>

              {/* Divider */}
              <div className="w-[1px] h-4 bg-white/20 mx-2" />

              {/* 2. CTA Button (Conversion Focus) */}
              <Link href="/contact" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-200">Start Project</span>
                <ArrowUpRight className="w-3 h-3 text-tpc-orange" />
              </Link>

              {/* 3. Menu Toggle Circle */}
              <button 
                onClick={() => setIsActive(true)}
                className="w-10 h-10 bg-tpc-orange rounded-full flex flex-col gap-[3px] items-center justify-center hover:scale-105 transition-transform text-black"
              >
                {/* Custom Hamburger Icon */}
                <span className="w-4 h-[2px] bg-black block" />
                <span className="w-4 h-[2px] bg-black block" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* =======================================
          FULL SCREEN MENU OVERLAY
         ======================================= */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div 
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 w-full h-[100dvh] bg-tpc-black text-white z-[60] flex flex-col justify-center items-center overflow-y-auto"
          >
            {/* Close Button Inside Menu */}
            <button 
              onClick={() => setIsActive(false)}
              className="absolute top-8 right-8 text-sm font-bold uppercase tracking-widest hover:text-tpc-orange transition-colors flex items-center gap-2"
            >
              Close <span className="text-xl">×</span>
            </button>

            <div className="flex flex-col gap-6 text-center">
              {navItems.map((item, index) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0, y: "100px" }}
                  animate={{ 
                    opacity: 1, 
                    y: "0px",
                    transition: { delay: 0.3 + (index * 0.1) } 
                  }}
                  className="overflow-hidden"
                >
                  {item.name === "Our Work" ? (
                    <div className="flex flex-col items-center">
                        <button 
                            onClick={() => setWorkMenuOpen(!workMenuOpen)}
                            className="text-[12vw] md:text-[6vw] font-bold leading-none hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-tpc-orange hover:to-white transition-all block uppercase tracking-tighter"
                        >
                            {item.name}
                        </button>
                        <AnimatePresence>
                            {workMenuOpen && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex flex-col gap-4 mt-6 overflow-hidden"
                                >
                                    <Link href="/work" onClick={() => { setIsActive(false); setWorkMenuOpen(false); }} className="text-2xl md:text-4xl font-bold hover:text-tpc-orange transition-colors tracking-tight">
                                        Content Creation
                                    </Link>
                                    <Link href="/work/web" onClick={() => { setIsActive(false); setWorkMenuOpen(false); }} className="text-2xl md:text-4xl font-bold hover:text-tpc-orange transition-colors tracking-tight">
                                        Web Development
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                  ) : item.name === "Services" ? (
                    <div className="flex flex-col items-center">
                        <button 
                            onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
                            className="text-[12vw] md:text-[6vw] font-bold leading-none hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-tpc-orange hover:to-white transition-all block uppercase tracking-tighter"
                        >
                            {item.name}
                        </button>
                        <AnimatePresence>
                            {servicesMenuOpen && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex flex-col gap-4 mt-6 overflow-hidden items-center"
                                >
                                    <Link href="/services#social-media" onClick={() => { setIsActive(false); setServicesMenuOpen(false); }} className="text-2xl md:text-4xl font-bold hover:text-tpc-orange transition-colors tracking-tight text-center">
                                        Social Media & Content
                                    </Link>
                                    <Link href="/services#influencer-marketing" onClick={() => { setIsActive(false); setServicesMenuOpen(false); }} className="text-2xl md:text-4xl font-bold hover:text-tpc-orange transition-colors tracking-tight text-center">
                                        Influencer Marketing
                                    </Link>
                                    <Link href="/services#performance-ads" onClick={() => { setIsActive(false); setServicesMenuOpen(false); }} className="text-2xl md:text-4xl font-bold hover:text-tpc-orange transition-colors tracking-tight text-center">
                                        Performance Ads
                                    </Link>
                                    <Link href="/services#web-development" onClick={() => { setIsActive(false); setServicesMenuOpen(false); }} className="text-2xl md:text-4xl font-bold hover:text-tpc-orange transition-colors tracking-tight text-center">
                                        Web Development
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                  ) : (
                    <Link 
                       href={item.href}
                       onClick={() => { setIsActive(false); setWorkMenuOpen(false); setServicesMenuOpen(false); }}
                       className="text-[12vw] md:text-[6vw] font-bold leading-none hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-tpc-orange hover:to-white transition-all block uppercase tracking-tighter"
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}