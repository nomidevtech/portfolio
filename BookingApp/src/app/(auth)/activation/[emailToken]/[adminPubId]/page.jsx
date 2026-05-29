/* eslint-disable react-hooks/error-boundaries, react-hooks/purity */
import { redisIpLimit } from "@/app/lib/redis";
import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Activate Clinic Account",
    description: "Activate a ClinicFlow clinic admin account.",
};

export default async function Activations({ params }) {

    const { emailToken, adminPubId } = await params;
    if (!emailToken || !adminPubId) return <main className="page-shell-narrow"><p className="status-error">Broken link.</p></main>

    const redisLimit = await redisIpLimit(5, "activation", 60 * 15);
    if (!redisLimit.ok) return <main className="page-shell-narrow"><p className="status-error">{redisLimit.message}</p></main>

    const fetchAdmin = await db.execute("SELECT * FROM admins WHERE public_id = ?", [adminPubId]);
    if (fetchAdmin.rows.length === 0) return <main className="page-shell-narrow"><p className="status-error">Admin not found.</p></main>

    if (fetchAdmin.rows[0].status === "verified") redirect("/");

    const tokenAge = Date.now() - new Date(fetchAdmin.rows[0].email_token_created_at).getTime();
    if (tokenAge > 1000 * 60 * 60 * 24) return <main className="page-shell-narrow"><p className="status-warning">Link expired. Please request a new one <Link href={`/verification/${fetchAdmin.rows[0].public_id}`} className="font-bold underline">here</Link>.</p></main>

    try {
        const success = await compare(emailToken, fetchAdmin.rows[0].email_token_hash);
        if (!success) return <main className="page-shell-narrow"><p className="status-error">Failed to activate. Please resend email and try again.</p></main>

        await Promise.all([
            db.execute("UPDATE admins SET status = 'verified', email_token_hash = NULL, email_token_created_at = NULL WHERE id = ?", [fetchAdmin.rows[0].id]),
            db.execute("UPDATE users SET status = 'verified' WHERE admin_id = ?", [fetchAdmin.rows[0].id])
        ]);

    } catch (error) {
        return <main className="page-shell-narrow"><p className="status-error">Failed to activate. Please resend email and try again.</p></main>
    }

    redirect("/login");
}
