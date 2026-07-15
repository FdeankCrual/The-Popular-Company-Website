import { headers } from "next/headers";
import EmployeeDashboard from "./EmployeeDashboard";

export default async function EmployeePage() {
  const headersList = await headers();
  const rolesStr = headersList.get("x-user-roles") || "[]";
  const email = headersList.get("x-user-email") || "Agent";
  const name = headersList.get("x-user-name") || "Employee";
  
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}
  
  return <EmployeeDashboard email={email} name={name} roles={roles} />;
}
