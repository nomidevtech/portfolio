import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";

export default async function VerifyEmail({ params }) {

    const adminId = 1;

    const { emailToken, bookingPubId } = await params;

    if (!emailToken || !bookingPubId) return <p>Broken link. Email not found.</p>;

    try {
        const fetch = await db.execute(`SELECT id, email_token_hash FROM bookings WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);
        if (fetch.rows.length === 0) return <p>Broken link. Email not found.</p>;

        const verified = await compare(emailToken, fetch.rows[0].email_token_hash);
        if (!verified) return <p>Broken link. Email not found.</p>;

        await db.execute(`UPDATE bookings SET email_token_hash = NULL, status = 'verified', email_token_created_at = CURRENT_TIMESTAMP WHERE public_id = ?`, [bookingPubId]);

    } catch (error) {
        console.error(error);
        return <p>Broken link. Email not found.</p>;
    }


    redirect(`/message/${bookingPubId}`);

}