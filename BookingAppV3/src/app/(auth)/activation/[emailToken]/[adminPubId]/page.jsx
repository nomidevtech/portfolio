import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";

export default async function Activations({ params }) {

    const { emailToken, adminPubId } = await params;
    if (!emailToken || !adminPubId) return <p>Broken link</p>

    const fetchAdmib = await db.execute("SELECT * FROM admins WHERE public_id = ?", [adminPubId]);
    if (fetchAdmib.rows.length === 0) return <p>Admin not found</p>

    if (fetchAdmib.rows[0].status === "verified") redirect("/");

    console.log("------------>", fetchAdmib.rows[0]);

    const success = await compare(emailToken, fetchAdmib.rows[0].email_token_hash);
    if (!success) return <p>Failed to activate. Please resend email and try again.</p>

    await Promise.all([
        db.execute("UPDATE admins SET status = 'verified', email_token_hash = NULL, email_token_created_at = NULL WHERE id = ?", [fetchAdmib.rows[0].id]),
        db.execute("UPDATE users SET status = 'verified' WHERE admin_id = ?", [fetchAdmib.rows[0].id])
    ]);

    redirect("/");

    return (<>
        <div>broken link</div>
    </>);
}