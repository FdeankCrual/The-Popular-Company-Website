import { headers } from "next/headers";
import EmployeeSidebar from "./components/EmployeeSidebar";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
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
      
      <EmployeeSidebar email={email} roles={roles} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-tpc-black h-[calc(100vh-60px)] md:h-screen relative pb-0">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
