import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";

export default async function VerifyEmail({ params }) {



    const { emailToken, bookingPubId, adminPubId } = await params;

    if (!emailToken || !bookingPubId || !adminPubId) return <p>Broken link. Email not found.</p>;

    const fetchAdmin = await db.execute(`SELECT id FROM admins WHERE public_id = ?`, [adminPubId]);
    if (fetchAdmin.rows.length === 0) return <p>Broken link. Email not found.</p>;

    const adminId = fetchAdmin.rows[0].id;

    try {

        const fetch = await db.execute(`SELECT id, email_token_hash FROM bookings WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);
        if (fetch.rows.length === 0) return <p>Broken link. Email not found.</p>;

        const verified = await compare(emailToken, fetch.rows[0].email_token_hash);
        if (!verified) return <p>Broken link. Email not found.</p>;

        await db.execute(`UPDATE bookings SET email_token_hash = NULL, status = 'verified', email_token_created_at = CURRENT_TIMESTAMP WHERE public_id = ? AND admin_id = ?`, [bookingPubId, adminId]);

    } catch (error) {
        console.error(error);
        return <p>Broken link. Email not found.</p>;
    }


    redirect(`/message/${bookingPubId}/${adminPubId}`);

}