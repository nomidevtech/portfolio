// src/app/dashboard/page.jsx

import { redirect } from "next/navigation";
import { getUserPlus } from "../lib/getUser";

export default async function Dashboard() {

  const currentUser = await getUserPlus();
  if (!currentUser?.id) return redirect("/login");

  if (currentUser.role === "admin" && currentUser.status !== "verified") {
    return redirect(`/verification/${currentUser.admin_details.public_id}`);
  }

  return (
    <>
      <div>dashboard</div>
    </>
  );
}