"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, LogOut, BookOpen, Calendar, Menu, X } from "lucide-react";

interface EmployeeSidebarProps {
  email: string;
  roles: string[];
}

export default function EmployeeSidebar({ email, roles }: EmployeeSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isSalesAgent = roles.includes("SALES AGENT");
  const isCreative = roles.includes("CONTENT WRITER") || roles.includes("EDITOR") || roles.includes("VIDEOGRAPHER") || roles.includes("GRAPHIC DESIGNER") || roles.includes("PAGE MANAGER") || roles.includes("CONTENT MANAGER") || roles.includes("AI VIDEO CREATOR") || roles.includes("ADMIN") || roles.includes("ADMIN_CONTENT");
  
  const navItems = [];
  
  if (isSalesAgent && !isCreative) {
    navItems.push({ name: "Analytics Dashboard", href: "/employee", icon: LayoutDashboard });
  } else {
    navItems.push({ name: "My Tasks", href: "/employee", icon: LayoutDashboard });
  }

  const hasResearchAccess = roles.includes("CONTENT WRITER") || roles.includes("ADMIN") || roles.includes("ADMIN_CONTENT") || roles.includes("FOUNDER");
  if (hasResearchAccess) {
    navItems.push({ name: "Client Research", href: "/employee/research", icon: BookOpen });
  }

  if (isSalesAgent || roles.includes("ADMIN") || roles.includes("ADMIN_CONTENT") || roles.includes("FOUNDER")) {
    navItems.push({ name: "My Leads", href: "/employee/leads", icon: CheckSquare });
  }

  if (roles.includes("GRAPHIC DESIGNER") || roles.includes("PAGE MANAGER") || roles.includes("CONTENT MANAGER") || roles.includes("ADMIN") || roles.includes("ADMIN_CONTENT") || roles.includes("FOUNDER")) {
    navItems.push({ name: "Content Manager", href: "/employee/content", icon: Calendar });
  }

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 z-[60] pointer-events-none pb-[env(safe-area-inset-bottom)] flex justify-center">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="pointer-events-auto flex items-center gap-2 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl hover:text-tpc-orange hover:border-tpc-orange/50 active:scale-95 transition-all"
        >
          {isOpen ? <X className="w-5 h-5 text-tpc-orange" /> : <Menu className="w-5 h-5" />}
          <span className="text-xs uppercase font-bold tracking-widest">Menu</span>
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col justify-between shrink-0 h-full
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex-1 overflow-y-auto">
          <div className="hidden md:flex h-20 items-center px-6 border-b border-white/10">
            <h1 className="font-black tracking-tighter uppercase text-xl">
              TPC <span className="text-tpc-orange">Portal</span>
            </h1>
          </div>
          
          <nav className="flex flex-col p-4 gap-2 mt-4 md:mt-0">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-2 px-2">Menu</div>
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/employee' && pathname?.startsWith(item.href));
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-tpc-orange/10 text-tpc-orange" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
          <div className="text-xs text-gray-400 font-mono break-all mb-4">
            Logged in as:<br/>
            <strong className="text-white">{email}</strong><br/>
            <span className="text-tpc-orange">[{roles.join(", ")}]</span>
          </div>
          <Link href="/admin/login" className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest font-bold">
            <LogOut className="w-4 h-4" /> Disconnect
          </Link>
        </div>
      </aside>
    </>
  );
}
