import { headers } from "next/headers";
import EmployeeDashboard from "./EmployeeDashboard";
import SalesDashboard from "./SalesDashboard";

export default async function EmployeePage() {
  const headersList = await headers();
  const rolesStr = headersList.get("x-user-roles") || "[]";
  const email = headersList.get("x-user-email") || "Agent";
  const name = headersList.get("x-user-name") || "Employee";
  
  let roles: string[] = [];
  try { roles = JSON.parse(rolesStr); } catch(e) {}
  
  const isSalesAgent = roles.includes("SALES AGENT");
  const isCreative = roles.includes("CONTENT WRITER") || roles.includes("EDITOR") || roles.includes("VIDEOGRAPHER") || roles.includes("GRAPHIC DESIGNER") || roles.includes("AI VIDEO CREATOR");
  
  if (isSalesAgent && !isCreative) {
    return <SalesDashboard email={email} name={name} />;
  }
  
  return <EmployeeDashboard email={email} name={name} roles={roles} />;
}
