import { headers } from "next/headers";
import AnalyticsHub from "../../admin/components/AnalyticsHub";

export const metadata = {
  title: "Analytics Hub | Employee Portal",
};

export default async function EmployeeAnalyticsPage() {
  const headersList = await headers();
  const rolesStr = headersList.get("x-user-roles") || "[]";
  
  let roles: string[] = [];
  try {
    roles = JSON.parse(rolesStr);
  } catch(e) {}

  return <AnalyticsHub initialRoles={roles} />;
}
