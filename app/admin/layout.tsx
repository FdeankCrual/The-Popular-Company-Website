import { headers } from "next/headers";
import CommandPalette from "./components/CommandPalette";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const rolesStr = headersList.get("x-user-roles") || "[]";
  const email = headersList.get("x-user-email") || "Agent";
  
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}

  return (
    <div className="admin-panel fixed inset-0 z-[10000] bg-tpc-black text-white flex flex-col md:flex-row overflow-hidden font-sans cursor-default">
      <style>{`
        .admin-panel, .admin-panel * { cursor: auto !important; }
        .admin-panel a, .admin-panel button, .admin-panel [role="button"] { cursor: pointer !important; }
      `}</style>
      
      <AdminSidebar email={email} roles={roles} />

      {/* COMMAND PALETTE */}
      <CommandPalette />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-tpc-black h-dvh relative pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
