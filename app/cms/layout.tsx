import { headers } from "next/headers";
import CMSSidebar from "./components/CMSSidebar";

export default async function CMSLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const name = headersList.get("x-user-name") || "Agent";
  const rolesStr = headersList.get("x-user-roles") || "[]";
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}
  
  const isContentWriterOnly = roles.includes("CONTENT WRITER") && !roles.some(r => r.startsWith("ADMIN"));

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col md:flex-row bg-[#191919] text-white font-sans overflow-hidden cursor-default">
      <CMSSidebar name={name} isContentWriterOnly={isContentWriterOnly} />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#191919] pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-0 min-h-0">
        {children}
      </main>

    </div>
  );
}
