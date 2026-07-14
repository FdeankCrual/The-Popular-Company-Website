"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion"; 
import Header from "../components/Header";
import Cursor from "../Cursor";
import { ArrowUpRight, Search } from "lucide-react";
import { Blog } from "../data/blogs";

export default function BlogClient({ blogs }: { blogs: Blog[] }) {
  const categories = ["All", ...Array.from(new Set(blogs.map(b => b.category).filter(Boolean)))];
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredBlogs = blogs.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black">
      <Cursor />
      <Header />

      {/* 1. HERO & FILTERS */}
      <section className="pt-40 px-6 md:px-12 pb-20">
        <h1 className="text-[12vw] md:text-[8vw] font-bold leading-none tracking-tighter mb-12 text-center md:text-left">
          TPC <span className="text-tpc-orange">JOURNAL.</span>
        </h1>
        
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-white/20 pb-8 gap-8">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
                <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                    ? "bg-white text-black" 
                    : "border border-white/20 hover:border-tpc-orange hover:text-tpc-orange"
                }`}
                >
                {cat}
                </button>
            ))}
            </div>

            {/* Search */}
            <div className="relative group w-full md:w-64">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-tpc-orange" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 py-2 pl-8 text-white focus:outline-none focus:border-tpc-orange transition-colors"
                />
            </div>
        </div>
      </section>

      {/* 2. THE SMOOTH INTERACTIVE LIST */}
      <section className="px-6 md:px-12 pb-32">
        <div className="flex flex-col">
          {filteredBlogs.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
                <motion.div 
                    initial="initial"
                    whileHover="hover"
                    className="group relative py-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                >
                    
                    {/* --- 📱 MOBILE BANNER (NEW ADDITION) --- */}
                    {/* Logic: 'md:hidden' ensures this ONLY shows on mobile.
                       It puts a nice 16:9 image above the text so users know what they are clicking.
                    */}
                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 md:hidden border border-white/10">
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* -------------------------------------- */}


                    <div className="z-10 relative transition-all duration-300 group-hover:px-4">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-tpc-orange font-mono text-xs uppercase tracking-widest">{post.category}</span>
                            <span className="text-gray-600 font-mono text-xs uppercase">{post.date}</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold group-hover:text-white/80 transition-colors">
                            {post.title}
                        </h2>
                    </div>

                    {/* Arrow Icon with Rotate Animation */}
                    <motion.div 
                        variants={{
                            initial: { opacity: 0, rotate: -45, x: 0 },
                            hover: { opacity: 1, rotate: 0, x: 10 }
                        }}
                        className="mt-4 md:mt-0 hidden md:block" // Hidden on mobile to clean up space
                    >
                        <ArrowUpRight className="w-8 h-8 text-tpc-orange" />
                    </motion.div>
                    
                    {/* Mobile Arrow (Always visible) */}
                    <div className="md:hidden mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tpc-orange">
                         Read Article <ArrowUpRight className="w-4 h-4" />
                    </div>

                    {/* THE DESKTOP HOVER REVEAL (Kept exactly the same) */}
                    <motion.div
                        variants={{
                            initial: { opacity: 0, scale: 0.8, rotate: 0 },
                            hover: { 
                                opacity: 1, 
                                scale: 1, 
                                rotate: 5,
                                transition: { type: "spring", stiffness: 100, damping: 15 }
                            }
                        }}
                        style={{ pointerEvents: "none" }}
                        className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] z-0"
                    >
                        <img 
                            src={post.image} 
                            alt="preview" 
                            className="w-full h-full object-cover rounded-xl shadow-2xl brightness-75"
                        />
                    </motion.div>
                </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}