import { headers } from "next/headers";
import StrategyDashboard from "../../admin/components/StrategyDashboard";

export default async function EmployeeStrategyPage() {
  const headersList = await headers();
  const rolesStr = headersList.get("x-user-roles") || "[]";
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}

  return <StrategyDashboard initialRoles={roles} />;
}
