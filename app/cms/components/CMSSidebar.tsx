"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Image, Layout, ArrowLeft, Menu, X } from "lucide-react";

interface CMSSidebarProps {
  name: string;
  isContentWriterOnly: boolean;
}

export default function CMSSidebar({ name, isContentWriterOnly }: CMSSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = isContentWriterOnly 
    ? [ { name: "Blogs", href: "/cms/blogs", icon: FileText } ]
    : [
      { name: "Blogs", href: "/cms/blogs", icon: FileText },
      { name: "Gallery", href: "/cms/gallery", icon: Image },
      { name: "Web", href: "/cms/web-portfolio", icon: Layout },
    ];

  return (
    <>
      {/* MOBILE HEADER (Top) */}
      <div className="md:hidden h-[60px] bg-[#111] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
        <h1 className="font-black tracking-tighter uppercase text-xl">
          TPC <span className="text-tpc-orange">CMS</span>
        </h1>
        <div className="w-7 h-7 rounded-full bg-tpc-orange/20 text-tpc-orange flex items-center justify-center font-bold text-xs">
          {name.charAt(0)}
        </div>
      </div>

      <div className="md:hidden fixed bottom-6 right-4 z-[60] pb-[env(safe-area-inset-bottom)]">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className={`group relative w-14 h-14 flex items-center justify-center rounded-2xl shadow-2xl transition-all duration-300 active:scale-95 ${isOpen ? 'bg-white border-white text-black' : 'bg-black/60 backdrop-blur-2xl border-white/20 text-white'} border`}
        >
          <div className="relative z-10 flex flex-col items-center justify-center w-6 h-6">
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="flex flex-col gap-1.5 w-5">
                 <div className="h-[2px] bg-current rounded-full w-4/5 self-end transition-all duration-300 group-active:w-full"></div>
                 <div className="h-[2px] bg-current rounded-full w-full transition-all duration-300"></div>
                 <div className="h-[2px] bg-current rounded-full w-4/5 self-start transition-all duration-300 group-active:w-full"></div>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR & MOBILE DRAWER */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#111] border-r border-white/10 flex flex-col shrink-0 h-[100dvh]
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-[60px] md:h-20 flex items-center px-6 border-b border-white/10 shrink-0 hidden md:flex">
          <h1 className="font-black tracking-tighter uppercase text-xl">
            TPC <span className="text-tpc-orange">CMS</span>
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-12 md:mt-0">
          <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Content Manager</div>
          
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium group ${
                  isActive ? "bg-white/10 text-white" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-4 h-4 transition-colors ${isActive ? "text-tpc-orange" : "text-gray-500 group-hover:text-tpc-orange"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 pb-8 md:pb-6 bg-[#111]">
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
    </>
  );
}
