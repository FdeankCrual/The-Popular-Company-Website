import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getBlogs, Blog } from "../data/blogs";

export default async function HomeBlog() {
  const allBlogs = await getBlogs();
  
  // 1. Extract explicitly featured blogs (where the 'featured' column is 'yes' or 'true')
  const featuredBlogs = allBlogs.filter(
    (b) => b.featured && (b.featured.toLowerCase() === 'yes' || b.featured.toLowerCase() === 'true' || b.featured === '1')
  );

  // 2. We want exactly 3 blogs for the Editorial Layout (1 hero + 2 stacked). 
  // If they haven't featured enough, we backfill with the most recent ones.
  let displayBlogs: Blog[] = [...featuredBlogs];
  if (displayBlogs.length < 3) {
    const unfeatured = allBlogs.filter((b) => !displayBlogs.find((fb) => fb.slug === b.slug));
    displayBlogs = [...displayBlogs, ...unfeatured].slice(0, 3);
  } else {
    displayBlogs = displayBlogs.slice(0, 3);
  }

  // Safety fallback if there are less than 3 total blogs
  if (displayBlogs.length === 0) return null;

  const heroBlog = displayBlogs[0];
  const stackedBlogs = displayBlogs.slice(1);

  return (
    <section className="py-20 border-t border-white/10">
      
      {/* SECTION HEADER */}
      <div className="px-6 md:px-12 flex justify-between items-end mb-12">
        <div>
          <span className="text-tpc-orange font-mono text-xs uppercase tracking-widest">
            Latest Thinking
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mt-2 tracking-tighter">FROM THE BLOG.</h2>
        </div>
        <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-tpc-orange transition-colors">
          Read All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* DESKTOP EDITORIAL LAYOUT (Hidden on mobile) */}
      <div className="hidden md:grid grid-cols-12 gap-8 px-12 pb-10">
        
        {/* HERO ARTICLE (Spans 7 columns) */}
        <Link 
          href={`/blog/${heroBlog.slug}`} 
          className="col-span-7 group block relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 h-[600px]"
        >
          {/* Image */}
          <div className="absolute inset-0">
            <img 
              src={heroBlog.image} 
              alt={heroBlog.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out opacity-70 group-hover:opacity-90"
            />
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 p-10 w-full">
            <div className="flex gap-3 mb-4">
              <span className="bg-tpc-orange text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {heroBlog.category}
              </span>
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-300 flex items-center">
                {heroBlog.date}
              </span>
            </div>
            
            <h3 className="text-4xl font-bold leading-tight group-hover:text-tpc-orange transition-colors mb-4 max-w-2xl">
              {heroBlog.title}
            </h3>
            
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Read Article <ArrowUpRight className="w-5 h-5 text-tpc-orange" />
            </div>
          </div>
        </Link>

        {/* STACKED ARTICLES (Spans 5 columns) */}
        <div className="col-span-5 flex flex-col gap-8 h-[600px]">
          {stackedBlogs.map((post) => (
            <Link 
              href={`/blog/${post.slug}`} 
              key={post.slug}
              className="group block relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 flex-1 flex flex-col"
            >
              {/* Image */}
              <div className="absolute inset-0">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out opacity-40 group-hover:opacity-60"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-8 w-full z-10">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-tpc-orange text-[10px] font-bold uppercase tracking-widest block">
                    {post.category}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {post.date}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold leading-tight group-hover:text-tpc-orange transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* MOBILE LAYOUT: Swipeable Cards */}
      <div className="flex md:hidden overflow-x-auto gap-6 px-6 pb-10 snap-x snap-mandatory no-scrollbar">
        {displayBlogs.map((post) => (
          <Link 
            href={`/blog/${post.slug}`} 
            key={post.slug}
            className="flex-shrink-0 w-[85vw] snap-center group block"
          >
            {/* IMAGE CARD */}
            <div className="relative aspect-[4/5] bg-neutral-900 rounded-xl overflow-hidden mb-4 border border-white/10">
              <div className="absolute inset-0 bg-neutral-800">
                 <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                 />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  {post.date}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
                 <span className="text-tpc-orange text-[10px] font-bold uppercase tracking-widest mb-2 block">
                  {post.category}
                 </span>
                 <h3 className="text-2xl font-bold leading-tight text-white mb-2 line-clamp-3">
                  {post.title}
                 </h3>
                 <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold">
                    Read <ArrowRight className="w-3 h-3" />
                 </div>
              </div>
            </div>
          </Link>
        ))}
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