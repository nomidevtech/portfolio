/* eslint-disable react-hooks/purity */
import Link from "next/link";
import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import ClientNewPassword from "./Client";
import { redisIpLimit } from "@/app/lib/redis";

export const metadata = {
    title: "Set New Password",
    description: "Set a new password from a secure recovery link.",
};

export default async function NewPassword({ params }) {

    const apiLimit = await redisIpLimit(25, "view_recovery_link", 60 * 15);
    if (!apiLimit.ok) return <main className="page-shell-narrow"><p className="status-error">{apiLimit.message}</p></main>;

    const { recoveryToken, adminPubId } = await params;
    if (!recoveryToken || !adminPubId) return <main className="page-shell-narrow"><p className="status-error">Broken link.</p></main>;

    const fetchData = await db.execute("SELECT * FROM admins WHERE public_id = ?", [adminPubId]);
    if (fetchData.rows.length === 0) return <main className="page-shell-narrow"><p className="status-error">Admin not found.</p></main>;

    const admin = fetchData.rows[0];

    if (!admin.recovery_token_hash || !admin.recovery_token_created_at) return <main className="page-shell-narrow"><p className="status-warning">Invalid or expired link.</p></main>;

    const tokenAge = Date.now() - new Date(admin.recovery_token_created_at).getTime();
    if (tokenAge > 1000 * 60 * 60 * 24) return <main className="page-shell-narrow"><p className="status-warning">Link expired. Please request a new one <Link href="/recovery" className="font-bold underline">here</Link>.</p></main>

    const match = await compare(recoveryToken, admin.recovery_token_hash);
    if (!match) return <main className="page-shell-narrow"><p className="status-error">Failed to verify. Please try again.</p></main>;


    return <ClientNewPassword adminPubId={admin.public_id} recoveryToken={recoveryToken} />;
}
