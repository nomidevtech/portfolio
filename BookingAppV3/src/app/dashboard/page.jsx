import { redirect } from "next/navigation";
import { getUserPlus } from "../lib/getUser";
import { getDashboardStats } from "./sa";
import ClientDashboard from "./Client";

export default async function Dashboard() {
  const currentUser = await getUserPlus();

  // Auth Check
  if (!currentUser?.id) return redirect("/login");

  // Status Check
  if (currentUser.role === "admin" && currentUser.status !== "verified") {
    return redirect(`/verification/${currentUser.admin_details.public_id}`);
  }

  // Fetch Data Securely from Server Action
  const statsRes = await getDashboardStats();

  if (!statsRes.ok) {
    return <div className="p-6 text-red-500 font-medium">{statsRes.message}</div>;
  }

  // Pass data to Client Component
  return (
    <ClientDashboard role={statsRes.role} stats={statsRes.data} />
  );
}