"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Users, FileText, Database, LogOut, UserCircle, CheckSquare, Wallet, Globe, BookOpen, Menu, X } from "lucide-react";

interface AdminSidebarProps {
  email: string;
  roles: string[];
}

export default function AdminSidebar({ email, roles }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "My Tasks", href: "/admin/my-tasks", icon: CheckSquare },
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Money", href: "/admin/money", icon: Wallet },
    { name: "Workbook", href: "/admin/workbook", icon: Database },
    { name: "Client Research", href: "/admin/research", icon: BookOpen },
    { name: "Website Leads", href: "/admin/leads", icon: Globe },
    { name: "Agent Leads", href: "/admin/agent-leads", icon: Users },
    { name: "Content", href: "/cms", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Employees", href: "/admin/employees", icon: UserCircle },
  ];

  return (
    <>
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center px-2 py-3 h-[60px]">
          <Link href="/admin" onClick={() => setIsOpen(false)} className={`flex flex-col items-center gap-1 hover:text-tpc-orange active:scale-95 transition-all w-[64px] ${pathname === '/admin' ? 'text-tpc-orange' : 'text-gray-400'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Dash</span>
          </Link>
          <Link href="/admin/my-tasks" onClick={() => setIsOpen(false)} className={`flex flex-col items-center gap-1 hover:text-tpc-orange active:scale-95 transition-all w-[64px] ${pathname?.startsWith('/admin/my-tasks') ? 'text-tpc-orange' : 'text-gray-400'}`}>
            <CheckSquare className="w-5 h-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Tasks</span>
          </Link>
          <Link href="/admin/leads" onClick={() => setIsOpen(false)} className={`flex flex-col items-center gap-1 hover:text-tpc-orange active:scale-95 transition-all w-[64px] ${pathname?.startsWith('/admin/leads') ? 'text-tpc-orange' : 'text-gray-400'}`}>
            <Globe className="w-5 h-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Leads</span>
          </Link>
          <Link href="/cms" onClick={() => setIsOpen(false)} className={`flex flex-col items-center gap-1 hover:text-tpc-orange active:scale-95 transition-all w-[64px] ${pathname?.startsWith('/cms') ? 'text-tpc-orange' : 'text-gray-400'}`}>
            <FileText className="w-5 h-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">CMS</span>
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="flex flex-col items-center gap-1 hover:text-tpc-orange active:scale-95 transition-all text-gray-400 w-[64px]">
            {isOpen ? <X className="w-5 h-5 text-tpc-orange" /> : <Menu className="w-5 h-5" />}
            <span className="text-[9px] uppercase font-bold tracking-wider">Menu</span>
          </button>
        </div>
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
              TPC <span className="text-tpc-orange">Admin</span>
            </h1>
          </div>
          
          <nav className="flex flex-col p-4 gap-2 mt-4 md:mt-0">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-2 px-2">Menu</div>
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
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
