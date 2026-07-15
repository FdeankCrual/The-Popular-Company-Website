import { headers } from "next/headers";
import Link from "next/link";
import { FileText, Image, Layout, ArrowLeft } from "lucide-react";

export default async function CMSLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const name = headersList.get("x-user-name") || "Agent";
  const rolesStr = headersList.get("x-user-roles") || "[]";
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}
  
  const isContentWriterOnly = roles.includes("CONTENT WRITER") && !roles.some(r => r.startsWith("ADMIN"));

  const navItems = isContentWriterOnly 
    ? [ { name: "Blogs", href: "/cms/blogs", icon: FileText } ]
    : [
      { name: "Blogs", href: "/cms/blogs", icon: FileText },
      { name: "Gallery", href: "/cms/gallery", icon: Image },
      { name: "Web", href: "/cms/web-portfolio", icon: Layout },
    ];

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col md:flex-row bg-[#191919] text-white font-sans overflow-hidden cursor-default">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[#111] border-r border-white/10 flex-col shrink-0 h-[100dvh]">
        <div className="h-[60px] md:h-20 flex items-center px-6 border-b border-white/10 shrink-0">
          <h1 className="font-black tracking-tighter uppercase text-xl">
            TPC <span className="text-tpc-orange">CMS</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Content Manager</div>
          
          <Link href="/cms/blogs" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-gray-300 hover:text-white font-medium group">
            <FileText className="w-4 h-4 text-gray-500 group-hover:text-tpc-orange transition-colors" />
            Blogs & Articles
          </Link>

          {!isContentWriterOnly && (
            <>
              <Link href="/cms/gallery" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-gray-300 hover:text-white font-medium group">
                <Image className="w-4 h-4 text-gray-500 group-hover:text-tpc-orange transition-colors" />
                Portfolio Gallery
              </Link>

              <Link href="/cms/web-portfolio" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-gray-300 hover:text-white font-medium group">
                <Layout className="w-4 h-4 text-gray-500 group-hover:text-tpc-orange transition-colors" />
                Web Portfolio
              </Link>
            </>
          )}

        </nav>

        <div className="p-6 border-t border-white/10 pb-8 md:pb-6">
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 flex items-center gap-2">
            CMS Access
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl mb-4">
            <div className="w-8 h-8 rounded-full bg-tpc-orange/20 text-tpc-orange flex items-center justify-center font-bold">
              {name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{name}</p>
              <p className="text-xs text-gray-500 truncate">Editor</p>
            </div>
          </div>
          <Link href="/employee" className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors text-gray-400 hover:text-white">
            <ArrowLeft className="w-3 h-3" /> Back to Tasks
          </Link>
        </div>
      </aside>

      {/* MOBILE NAV (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 flex justify-around p-2 z-50 pb-6 md:pb-2">
         {navItems.map(item => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 p-2 flex-1 text-gray-400 hover:text-white"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] uppercase font-bold truncate w-full text-center">{item.name}</span>
            </Link>
          ))}
          <Link href="/employee" className="flex flex-col items-center justify-center gap-1 p-2 flex-1 text-gray-400 hover:text-white border-l border-white/10 ml-1">
             <ArrowLeft className="w-5 h-5" />
             <span className="text-[9px] uppercase font-bold">Tasks</span>
          </Link>
      </nav>

      {/* MOBILE HEADER */}
      <div className="md:hidden h-[60px] bg-[#111] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-40 relative">
        <h1 className="font-black tracking-tighter uppercase text-xl">
          TPC <span className="text-tpc-orange">CMS</span>
        </h1>
        <div className="w-7 h-7 rounded-full bg-tpc-orange/20 text-tpc-orange flex items-center justify-center font-bold text-xs">
          {name.charAt(0)}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#191919] pb-24 md:pb-0 relative z-30">
        {children}
      </main>

    </div>
  );
}
