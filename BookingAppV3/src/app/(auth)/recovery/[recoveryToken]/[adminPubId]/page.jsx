import Link from "next/link";
import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import ClientNewPassword from "./Client";

export default async function NewPassword({ params }) {
    const { recoveryToken, adminPubId } = await params;
    if (!recoveryToken || !adminPubId) return <div>Broken Link</div>;

    const fetchData = await db.execute("SELECT * FROM admins WHERE public_id = ?", [adminPubId]);
    if (fetchData.rows.length === 0) return <div>Admin not found.</div>;

    const admin = fetchData.rows[0];

    if (!admin.recovery_token_hash || !admin.recovery_token_created_at) return <div>Invalid or expired link.</div>;

    const tokenAge = Date.now() - new Date(admin.recovery_token_created_at).getTime();
    if (tokenAge > 1000 * 60 * 60 * 24) return <><p>Link expired. Please request a new one <Link href="/recovery">here</Link>.</p></>

    const match = await compare(recoveryToken, admin.recovery_token_hash);
    if (!match) return <div>Failed to verify. Please try again.</div>;

   
    return <ClientNewPassword adminPubId={admin.public_id} recoveryToken={recoveryToken} />;
}