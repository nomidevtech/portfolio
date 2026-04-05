import { getUser } from "@/app/lib/getUser";
import DeleteClient from "./Client";
import { redirect } from "next/navigation";

export default async function DeleteAccount() {
  const user = await getUser();
  if (!user?.id) return redirect("/login");
  return <DeleteClient />;
}
