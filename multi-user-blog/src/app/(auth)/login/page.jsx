import { getUser } from "@/app/lib/getUser";
import Client from "./Client";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getUser();
  if (user?.id) return redirect("/settings");
  return <Client />;
}
