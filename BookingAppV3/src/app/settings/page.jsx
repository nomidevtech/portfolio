import { redirect } from "next/navigation";
import { getUserPlus } from "../lib/getUser";
import ClientSettings from "./ClientSettings";

export default async function Settings() {
  const currentUser = await getUserPlus();
  if (!currentUser?.id) return redirect("/login");

  if (currentUser.role === "admin" && currentUser.status !== "verified") return redirect(`/verification/${currentUser.admin_details.public_id}`);

  if (currentUser.status !== "verified") return <p>Your account is not verified. Contact your admin or check your email.</p>

  if (currentUser.role === "admin") {
    const { public_id, admin_name, admin_username, admin_email, clinic_name, clinic_phone, clinic_address } = currentUser.admin_details;
    return <ClientSettings role="admin" adminPubId={public_id} admin_name={admin_name} admin_username={admin_username} admin_email={admin_email} clinic_name={clinic_name} clinic_phone={clinic_phone} clinic_address={clinic_address} />;
  }

  if (currentUser.role === "doctor") {
    const { public_id, name, username, qualifications } = currentUser.doctor_details;
    return <ClientSettings role="doctor" docPublicId={public_id} name={name} username={username} qualifications={qualifications} />;
  }

  return <p>Broken link. User not found. Try again or Logout then login again</p>;
}