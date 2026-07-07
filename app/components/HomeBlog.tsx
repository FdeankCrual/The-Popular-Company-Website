"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogs } from "../data/blogs"; // <--- CONNECTED TO YOUR REAL DATA

export default function HomeBlog() {
  // We take the first 4 blogs to fill the desktop grid perfectly
  const recentBlogs = blogs.slice(0, 4);

  return (
    <section className="py-20 border-t border-white/10">
      
      {/* SECTION HEADER */}
      <div className="px-6 md:px-12 flex justify-between items-end mb-10">
        <div>
          <span className="text-tpc-orange font-mono text-xs uppercase tracking-widest">
            Latest Thinking
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2">FROM THE BLOG</h2>
        </div>
        <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-tpc-orange transition-colors">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* LAYOUT SWITCHER:
          1. Mobile: 'flex overflow-x-auto' (Netflix Horizontal Scroll)
          2. Desktop: 'md:grid md:grid-cols-4' (Clean Grid)
      */}
      <div className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible gap-6 px-6 md:px-12 pb-10 snap-x snap-mandatory no-scrollbar">
        
        {recentBlogs.map((post) => (
          <Link 
            href={`/blog/${post.slug}`} // <--- Dynamic Link
            key={post.slug}
            className="flex-shrink-0 w-[85vw] md:w-auto snap-center group block"
          >
            {/* IMAGE CARD */}
            <div className="relative aspect-[16/10] bg-neutral-900 rounded-xl overflow-hidden mb-4 border border-white/10">
              
              {/* Image with Zoom Effect */}
              <div className="absolute inset-0 bg-neutral-800">
                 <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                 />
              </div>
              
              {/* Floating Date Badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  {post.date}
                </span>
              </div>
            </div>

            {/* TEXT CONTENT */}
            <div className="pr-4">
              <span className="text-tpc-orange text-[10px] font-bold uppercase tracking-widest mb-2 block">
                {post.category}
              </span>
              <h3 className="text-xl md:text-xl font-bold leading-tight group-hover:text-tpc-orange transition-colors line-clamp-2">
                {post.title}
              </h3>
              
              {/* 'Read Article' Arrow - Appears on Hover */}
              <p className="text-sm text-gray-500 mt-3 flex items-center gap-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Read Article <ArrowRight className="w-3 h-3" />
              </p>
            </div>
          </Link>
        ))}
        
        {/* MOBILE ONLY: 'VIEW ALL' CARD (Appears at the end of the swipe) */}
        <Link 
            href="/blog"
            className="flex-shrink-0 w-[40vw] md:hidden snap-center flex flex-col items-center justify-center border border-white/10 rounded-xl bg-white/5"
        >
            <span className="text-sm font-bold uppercase tracking-widest mb-2">View All</span>
            <div className="w-8 h-8 rounded-full bg-tpc-orange flex items-center justify-center text-black">
                <ArrowRight className="w-4 h-4" />
            </div>
        </Link>

      </div>

      {/* MOBILE ONLY: BOTTOM BUTTON */}
      <div className="px-6 md:hidden mt-4">
         <Link href="/blog" className="block w-full py-4 text-center border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
            Read All Articles
         </Link>
      </div>

    </section>
  );
}