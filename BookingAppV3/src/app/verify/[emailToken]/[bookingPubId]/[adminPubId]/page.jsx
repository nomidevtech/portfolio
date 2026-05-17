import { redisIpLimit } from "@/app/lib/redis";
import { db } from "@/app/lib/turso";
import { compare, hash } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { sendEmail } from "@/app/lib/resend";
import Link from "next/link";
import { isRedirectError } from "next/dist/client/components/redirect-error";


export default async function VerifyEmail({ params }) {
    try {

        const redisLimit = await redisIpLimit(15, "verify", 60 * 15);
        if (!redisLimit.ok) return <p>{redisLimit.message}</p>

        const { emailToken, bookingPubId, adminPubId } = await params;

        if (!emailToken || !bookingPubId || !adminPubId) return <p>Broken link. Email not found.</p>;


        const fetchAdmin = await db.execute(`SELECT id FROM admins WHERE public_id = ?`, [adminPubId]);
        if (fetchAdmin.rows.length === 0) return <p>Broken link. Email not found.</p>;

        const adminId = fetchAdmin.rows[0].id;


        const fetchBooking = await db.execute(`SELECT id, patient_email, patient_name, email_token_hash, email_token_created_at FROM bookings WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);
        if (fetchBooking.rows.length === 0 || !fetchBooking.rows[0].email_token_created_at) return <p>Broken link. Email not found.</p>;

        const tokenAge = Date.now() - new Date(fetchBooking.rows[0].email_token_created_at).getTime();
        if (tokenAge > 1000 * 60 * 60 * 24) return <p>Link expired. Please request a new one <Link href={`/message/${bookingPubId}/${adminPubId}`}>here</Link>.</p>


        if (!fetchBooking.rows[0].email_token_hash) {
            redirect(`/message/${bookingPubId}/${adminPubId}`);
        }

        const verified = await compare(emailToken, fetchBooking.rows[0].email_token_hash);
        if (!verified) return <p>Broken link. Email not found.</p>;


        const updateResult = await db.execute(`UPDATE bookings SET email_token_hash = NULL, status = 'verified', email_token_created_at = NULL WHERE id = ? AND admin_id = ? AND status = 'unverified' AND email_token_hash IS NOT NULL`, [fetchBooking.rows[0].id, adminId]);

        if (updateResult.rowsAffected === 0) redirect(`/message/${bookingPubId}/${adminPubId}`);



        const cancel_token = crypto.randomBytes(32).toString("hex");
        const hashed = await hash(cancel_token);

        await db.execute(`UPDATE bookings SET cancel_token_hash = ?, cancel_token_created_at = CURRENT_TIMESTAMP WHERE admin_id = ? AND id = ?`, [hashed, adminId, fetchBooking.rows[0].id]);

        const email = fetchBooking.rows[0].patient_email ? fetchBooking.rows[0].patient_email : null;
        const name = fetchBooking.rows[0].patient_name ? fetchBooking.rows[0].patient_name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Valued Patient";

        if (email) {
            const subject = `Cancel Your Appointment`;
            const to = email;
            const html = `
                   <p>Dear ${name}, You can cancel your appointment.</p >
                   <p>Click on button to cancel your appointment.</p>
                   <a href="${process.env.NEXT_PUBLIC_APP_URL}/cancel/${cancel_token}/${bookingPubId}/${adminPubId}">Cancel Appointment</a>
        `;

            await sendEmail({ to, subject, html });
        }

        redirect(`/message/${bookingPubId}/${adminPubId}`);

    } catch (error) {
        if (isRedirectError(error)) throw error;
        return <p>Something went wrong. Please try again.</p>;
    }
}