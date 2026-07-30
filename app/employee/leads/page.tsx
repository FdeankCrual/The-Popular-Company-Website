import { headers } from "next/headers";
import EmployeeLeadsDashboard from "./EmployeeLeadsDashboard";

export default async function EmployeeLeadsPage() {
  const headersList = await headers();
  const email = headersList.get("x-user-email") || "Agent";
  const name = headersList.get("x-user-name") || "Employee";
  
  return <EmployeeLeadsDashboard email={email} name={name} />;
}
