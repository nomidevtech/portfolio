import { AdminEmailVerification } from "@/app/components/emailVerification";
import { db } from "@/app/lib/turso";
import Form from "next/form";
import { redirect } from "next/navigation";
import { changeAdminEmailSA } from "./sa";

export default async function AdminVerification({ params }) {

  const { adminPubId } = await params;
  if (!adminPubId) return <p>Broken link</p>

  const fetchAdmin = await db.execute(`SELECT id, status, admin_email FROM admins WHERE public_id = ?`, [adminPubId]);
  if (fetchAdmin.rows.length === 0) return <p>Broken link</p>

  if (fetchAdmin.rows[0].status === "verified") redirect("/");



  return (<>
    <p>Email: {fetchAdmin.rows[0].admin_email}</p>
    <p>Status: {fetchAdmin.rows[0].status}</p>
    <details>
      <summary>Change Email</summary>
      <Form action={changeAdminEmailSA} >
        <input type="hidden" name="adminPubId" value={adminPubId} />
        <input type="email" name="email" placeholder="Email" />
        <button>Change</button>
      </Form>
    </details>
    <AdminEmailVerification adminPubId={adminPubId} />
  </>);
}