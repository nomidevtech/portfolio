/* eslint-disable react-hooks/error-boundaries, react-hooks/purity */
import { redisIpLimit } from "@/app/lib/redis";
import { db } from "@/app/lib/turso";
import { compare, hash } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { sendEmail } from "@/app/lib/resend";
import Link from "next/link";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export const metadata = {
    title: "Verify Booking Email",
    description: "Verify patient email to confirm an appointment booking.",
};

export default async function VerifyEmail({ params }) {
    try {
        const redisLimit = await redisIpLimit(15, "verify", 60 * 15);
        if (!redisLimit.ok) return <main className="page-shell-narrow"><p className="status-error">{redisLimit.message}</p></main>;

        const { emailToken, bookingPubId, adminPubId } = await params;
        if (!emailToken || !bookingPubId || !adminPubId) return <main className="page-shell-narrow"><p className="status-error">Broken link. Email not found.</p></main>;

        const fetchAdmin = await db.execute(`SELECT id FROM admins WHERE public_id = ?`, [adminPubId]);
        if (fetchAdmin.rows.length === 0) return <main className="page-shell-narrow"><p className="status-error">Broken link. Email not found.</p></main>;

        const adminId = fetchAdmin.rows[0].id;

        const fetchBooking = await db.execute(
            `SELECT id, patient_email, patient_name, email_token_hash, email_token_created_at FROM bookings WHERE admin_id = ? AND public_id = ?`,
            [adminId, bookingPubId]
        );

        const booking = fetchBooking.rows[0];
        if (!booking || !booking.email_token_created_at) return <main className="page-shell-narrow"><p className="status-error">Broken link. Email not found.</p></main>;

        const tokenAge = Date.now() - new Date(booking.email_token_created_at).getTime();
        if (tokenAge > 1000 * 60 * 60 * 24) {
            return <main className="page-shell-narrow"><p className="status-warning">Link expired. Please request a new one <Link href={`/message/${bookingPubId}/${adminPubId}`} className="font-bold underline">here</Link>.</p></main>;
        }

        if (!booking.email_token_hash) redirect(`/message/${bookingPubId}/${adminPubId}`);

        const verified = await compare(emailToken, booking.email_token_hash);
        if (!verified) return <main className="page-shell-narrow"><p className="status-error">Broken link. Email not found.</p></main>;

        const cancel_token = crypto.randomBytes(32).toString("hex");
        const hashed = await hash(cancel_token);

        const updateResult = await db.execute(
            `UPDATE bookings 
             SET email_token_hash = NULL, 
                 status = 'verified', 
                 email_token_created_at = NULL,
                 cancel_token_hash = ?, 
                 cancel_token_created_at = CURRENT_TIMESTAMP 
             WHERE id = ? AND admin_id = ? AND status = 'unverified' AND email_token_hash IS NOT NULL`,
            [hashed, booking.id, adminId]
        );

        if (updateResult.rowsAffected === 0) redirect(`/message/${bookingPubId}/${adminPubId}`);

        if (booking.patient_email) {
            const name = booking.patient_name
                ? booking.patient_name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
                : "Valued Patient";

            await sendEmail({
                to: booking.patient_email,
                subject: `Cancel Your Appointment`,
                html: `<p>Dear ${name}, You can cancel your appointment.</p><p>Click on button to cancel your appointment.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/cancel/${cancel_token}/${bookingPubId}/${adminPubId}">Cancel Appointment</a>
                <p>Click here to check current status of your booking.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/message/${bookingPubId}/${adminPubId}">Check Booking Status</a>`,
            });
        }

        redirect(`/message/${bookingPubId}/${adminPubId}`);

    } catch (error) {
        if (isRedirectError(error)) throw error;
        return <main className="page-shell-narrow"><p className="status-error">Something went wrong. Please try again.</p></main>;
    }
}
