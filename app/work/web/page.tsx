"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Header from "../../components/Header";
import Cursor from "../../Cursor";

const webProjects = [
  {
    id: 1,
    title: "Portfolio",
    category: "Creative Portfolio",
    image: "/thumbnails/portfolio_real.png",
    link: "https://fdeankcrual.github.io/Portfolio/"
  },
  {
    id: 2,
    title: "Welocity",
    category: "Corporate Website",
    image: "https://image.thum.io/get/width/1200/crop/800/https://fdeankcrual.github.io/Portfolio/websites/welocity/index.html",
    link: "https://fdeankcrual.github.io/Portfolio/websites/welocity/index.html"
  },
  {
    id: 3,
    title: "Foundic Network",
    category: "Business Network",
    image: "https://image.thum.io/get/width/1200/crop/800/https://foundicnetwork.com/",
    link: "https://foundicnetwork.com/"
  },
  {
    id: 4,
    title: "Wignet",
    category: "Tech Website",
    image: "https://image.thum.io/get/width/1200/crop/800/https://fdeankcrual.github.io/Portfolio/websites/wignet/index.html",
    link: "https://fdeankcrual.github.io/Portfolio/websites/wignet/index.html"
  },
  {
    id: 5,
    title: "Hines",
    category: "Real Estate/Corporate",
    image: "https://image.thum.io/get/width/1200/crop/800/https://fdeankcrual.github.io/Portfolio/websites/hines/index.html",
    link: "https://fdeankcrual.github.io/Portfolio/websites/hines/index.html"
  },
  {
    id: 6,
    title: "Hines V1",
    category: "Concept Design",
    image: "https://image.thum.io/get/width/1200/crop/800/https://fdeankcrual.github.io/Portfolio/websites/hines-v1/index.html",
    link: "https://fdeankcrual.github.io/Portfolio/websites/hines-v1/index.html"
  },
  {
    id: 7,
    title: "Caracal Bharat",
    category: "Brand Website",
    image: "https://image.thum.io/get/width/1200/crop/800/https://caracalbharat.com/",
    link: "https://caracalbharat.com/"
  },
  {
    id: 8,
    title: "The Popular Company",
    category: "Agency Website",
    image: "https://image.thum.io/get/width/1200/crop/800/https://thepopularcompany.com/",
    link: "https://thepopularcompany.com/"
  },
  {
    id: 9,
    title: "Dorklab Tech",
    category: "Tech Website",
    image: "https://image.thum.io/get/width/1200/crop/800/https://dorklab.tech/",
    link: "https://dorklab.tech/"
  }
];

export default function WebPortfolioPage() {
  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black">
      <Cursor />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 px-6 md:px-12 pb-12 max-w-7xl mx-auto">
        {/* Work Category Toggle */}
        <div className="flex justify-center md:justify-start mb-8">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md relative">
            <Link 
              href="/work" 
              className="relative z-10 px-6 py-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              Content Creation
            </Link>
            <Link 
              href="/work/web" 
              className="relative z-10 px-6 py-2 text-sm font-bold uppercase tracking-widest text-black"
            >
              <motion.div layoutId="work-toggle" className="absolute inset-0 bg-tpc-orange rounded-full -z-10" />
              Web Development
            </Link>
          </div>
        </div>

        <h1 className="text-[12vw] md:text-[6vw] font-bold leading-none tracking-tighter mb-8 text-center md:text-left">
          WEB <span className="text-tpc-orange">EXPERIENCES.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed text-center md:text-left border-b border-white/10 pb-8 mb-8">
          High-performance, beautifully animated websites that turn visitors into customers. Here are some of our recent digital builds.
        </p>
      </section>

      {/* Grid Section */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {webProjects.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group cursor-pointer"
            >
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/10 relative">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-tpc-orange text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors">
                        Visit Live Site <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
              </div>
              <div className="flex justify-between items-center px-2">
                <div>
                  <h3 className="text-3xl font-bold group-hover:text-tpc-orange transition-colors">{project.title}</h3>
                  <p className="text-gray-500 font-mono text-sm uppercase mt-2">{project.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
