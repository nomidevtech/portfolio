import { redirect } from "next/navigation";
import { getUserPlus } from "../lib/getUser";
import { getDashboardStats } from "./sa";
import ClientDashboard from "./Client";

export const metadata = {
  title: "Dashboard",
  description: "View clinic and appointment booking statistics.",
};

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
    return <main className="page-shell"><p className="status-error">{statsRes.message}</p></main>;
  }

  // Pass data to Client Component
  return (
    <ClientDashboard role={statsRes.role} stats={statsRes.data} />
  );
}
