import { headers } from "next/headers";
import MyTasksClient from "./MyTasksClient";

export default async function MyTasksPage() {
  const headersList = await headers();
  const name = headersList.get("x-user-name") || "Admin";
  
  return <MyTasksClient initialName={name} />;
}
