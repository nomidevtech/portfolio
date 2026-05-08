import { redirect } from "next/navigation";
import Form from "next/form";
import { getUserPlus } from "../lib/getUser";
import { updateAdmin, updateDoctor } from "./sa";

export default async function Settings() {

  const currentUser = await getUserPlus();
  if (!currentUser?.id) return redirect("/login");

  let user = null;
  if (currentUser.role === "admin") {
    user = currentUser.admin_details;
    return <AdminComponent user={user} />
  }
  if (currentUser.role === "doctor") {
    user = currentUser.doctor_details;
    return <DoctorComponent user={user} />
  }
  return <p>Broken link. User not found. Try again or Logout then login again</p>;

}





function AdminComponent({ user }) {
  return (<>
    <Form action={updateAdmin}>
      <input type="hidden" name="adminPubId" value={user.public_id} />
      <input type="text" name="name" placeholder="Name" defaultValue={user.admin_name} />
      <input type="text" name="username" placeholder="username" defaultValue={user.admin_username} />
      <input type="email" name="email" placeholder="example@ex.com" defaultValue={user.admin_email} />
      <input type="text" name="clinic_name" placeholder="Clinic Name" defaultValue={user.clinic_name} />
      <input type="tel" name="clinic_phone" placeholder="+1 000 000 0000" defaultValue={user.clinic_phone} />
      <input type="text" name="clinic_address" placeholder="Street #00" defaultValue={user.clinic_address} />
      <details>
        <summary>Change Password</summary>
        <input type="password" name="current_password" placeholder="Current Password" />
        <input type="password" name="new_password" placeholder="New Password" />
      </details>
      <button type="submit">Save Changes⬅</button>
    </Form>
  </>);
};


function DoctorComponent({ user }) {

  let qualifications = "";
  try {
    qualifications = JSON.parse(user.qualifications || "[]").join(', ').toUpperCase();
  } catch (e) { qualifications = ""; }


  return (<>
    <Form action={updateDoctor}>
      <input type="hidden" name="docPublicId" value={user.public_id} />
      <input type="text" name="name" placeholder="Name" defaultValue={user.name} />
      <input type="text" name="username" placeholder="Username" defaultValue={user.username} />
      <input type="text" name="qualifications" placeholder="Qualifications (e.g. MBBS, MD)" defaultValue={qualifications} />
      <details>
        <summary>Change Password</summary>
        <input type="password" name="current_password" placeholder="Current Password" />
        <input type="password" name="new_password" placeholder="New Password" />
      </details>
      <button type="submit">Update⬅</button>
    </Form>
  </>);
};