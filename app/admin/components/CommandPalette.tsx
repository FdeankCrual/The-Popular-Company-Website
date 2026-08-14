"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, Settings, Users, FileText, Database, CheckSquare, Wallet, Globe, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "My Tasks", href: "/admin/my-tasks", icon: CheckSquare },
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Money", href: "/admin/money", icon: Wallet },
  { name: "Workbook", href: "/admin/workbook", icon: Database },
  { name: "Website Leads", href: "/admin/leads", icon: Globe },
  { name: "Agent Leads", href: "/admin/agent-leads", icon: Users },
  { name: "Content", href: "/cms", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Employees", href: "/admin/employees", icon: Users },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const filteredItems = navItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[20000]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-[20001]"
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-mono text-sm"
              />
              <div className="text-xs font-mono text-gray-500 bg-white/10 px-2 py-1 rounded">ESC</div>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 font-mono">
                  No results found.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left group"
                  >
                    <item.icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                      {item.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
