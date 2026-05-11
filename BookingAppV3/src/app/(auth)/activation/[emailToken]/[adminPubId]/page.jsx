import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Activations({ params }) {

    const { emailToken, adminPubId } = await params;
    if (!emailToken || !adminPubId) return <p>Broken link</p>

    const fetchAdmin = await db.execute("SELECT * FROM admins WHERE public_id = ?", [adminPubId]);
    if (fetchAdmin.rows.length === 0) return <p>Admin not found</p>

    if (fetchAdmin.rows[0].status === "verified") redirect("/");

    const tokenAge = Date.now() - new Date(fetchAdmin.rows[0].email_token_created_at).getTime();
    if (tokenAge > 1000 * 60 * 60 * 24) return <><p>Link expired. Please request a new one <Link href={`/verification/${fetchAdmin.rows[0].public_id}`}>here</Link>.</p></>

    try {
        const success = await compare(emailToken, fetchAdmin.rows[0].email_token_hash);
        if (!success) return <p>Failed to activate. Please resend email and try again.</p>

        await Promise.all([
            db.execute("UPDATE admins SET status = 'verified', email_token_hash = NULL, email_token_created_at = NULL WHERE id = ?", [fetchAdmin.rows[0].id]),
            db.execute("UPDATE users SET status = 'verified' WHERE admin_id = ?", [fetchAdmin.rows[0].id])
        ]);

    } catch (error) {
        return <p>Failed to activate. Please resend email and try again.</p>
    }

    redirect("/");
}