import { headers } from "next/headers";
import ContentManager from "./ContentManager";

export default async function ContentManagerPage() {
  const headersList = await headers();
  const rolesStr = headersList.get("x-user-roles") || "[]";
  const email = headersList.get("x-user-email") || "Agent";
  const name = headersList.get("x-user-name") || "Employee";
  
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}
  
  if (!roles.includes("GRAPHIC DESIGNER") && !roles.includes("PAGE MANAGER") && !roles.includes("CONTENT MANAGER") && !roles.includes("ADMIN") && !roles.includes("ADMIN_CONTENT") && !roles.includes("FOUNDER")) {
    return <div className="p-8 text-white">Access Denied: Page Manager Only</div>;
  }
  
  return <ContentManager email={email} name={name} roles={roles} />;
}
