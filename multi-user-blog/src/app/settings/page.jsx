import { redirect } from "next/navigation";
import SettingsForm from "./Client";
import { getUser } from "../lib/getUser";

export default async function SettingsPage() {
  const result = await getUser();
  if (!result?.id) redirect("/login");
  const user = { public_id: result.public_id, name: result.name, username: result.username, email: result.email, role: result.role, email_verified: result.email_verified };
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Settings</h1>
      <SettingsForm serializedUser={JSON.stringify(user)} />
    </div>
  );
}
