import { blogs } from "../../data/blogs";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


// 1. TELL NEXT.JS WHAT BLOGS EXIST (Crucial for 'npm run build')
export async function generateStaticParams() {
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

// 2. DYNAMIC SEO (Browser Tab Title)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);
  
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160) + "...", // Uses first 160 chars as description
    openGraph: {
      images: [post.image],
    },
  };
}

// 3. THE PAGE CONTENT
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);

  // If slug doesn't match any blog, show 404
  if (!post) {
    notFound();
  }

  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black">
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Back Button */}
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-tpc-orange transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Journal</span>
        </Link>

        {/* Categories & Date */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="px-3 py-1 border border-tpc-orange text-tpc-orange rounded-full text-[10px] font-bold uppercase tracking-widest">
            {post.category}
          </span>
          <div className="flex items-center gap-2 text-gray-500 text-xs font-mono uppercase">
            <Calendar className="w-3 h-3" />
            {post.date}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter mb-12">
          {post.title}
        </h1>

        {/* Cover Image */}
        <div className="w-full aspect-video relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* --- ARTICLE CONTENT --- */}
      <article className="px-6 md:px-12 max-w-4xl mx-auto pb-32">
        <div 
            className="prose prose-invert prose-lg md:prose-xl max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-tpc-orange prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-blockquote:border-tpc-orange prose-blockquote:bg-white/5 prose-blockquote:p-6 prose-blockquote:rounded-r-lg"
        >
            {/* We render the content here. 
               If your 'content' in blogs.ts is HTML, use dangerouslySetInnerHTML.
               If it's plain text, just {post.content} 
            */}
             <div dangerouslySetInnerHTML={{ __html: post.content || "<p>No content available.</p>" }} />
        </div>
      </article>

      <Footer />
    </main>
  );
}