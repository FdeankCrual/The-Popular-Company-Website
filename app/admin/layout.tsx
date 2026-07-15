import { headers } from "next/headers";
import Link from "next/link";
import { LayoutDashboard, Settings, Users, FileText, Database, LogOut, UserCircle, HelpCircle } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const rolesStr = headersList.get("x-user-roles") || "[]";
  const email = headersList.get("x-user-email") || "Agent";
  
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Workbook", href: "/admin/workbook", icon: Database },
    { name: "Leads", href: "/admin/leads", icon: Users },
    { name: "Content", href: "/cms", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Employees", href: "/admin/employees", icon: UserCircle }, // New Employees Tab
  ];

  return (
    <div className="admin-panel fixed inset-0 z-[10000] bg-tpc-black text-white flex flex-col md:flex-row overflow-hidden font-sans cursor-default">
      <style>{`
        .admin-panel, .admin-panel * { cursor: auto !important; }
        .admin-panel a, .admin-panel button, .admin-panel [role="button"] { cursor: pointer !important; }
      `}</style>
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col justify-between shrink-0 h-[60px] md:h-full z-20">
        <div>
          <div className="h-[60px] md:h-20 flex items-center px-6 border-b border-white/10">
            <h1 className="font-black tracking-tighter uppercase text-xl">
              TPC <span className="text-tpc-orange">Admin</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex flex-col p-4 gap-2">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-2 px-2">Menu</div>
            {navItems.map(item => (
              <Link 
                key={item.name} 
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:block p-6 border-t border-white/10">
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

      {/* MOBILE NAV (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 flex justify-around p-2 z-50">
         {navItems.map(item => (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold">{item.name}</span>
            </Link>
          ))}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-tpc-black h-[calc(100vh-60px)] md:h-screen relative pb-20 md:pb-0">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
