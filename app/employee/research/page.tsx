import { headers } from "next/headers";
import ClientResearchHub from "../../admin/components/ClientResearchHub";

export default async function EmployeeResearchPage() {
  const headersList = await headers();
  const rolesStr = headersList.get("x-user-roles") || "[]";
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}

  return <ClientResearchHub initialRoles={roles} />;
}
