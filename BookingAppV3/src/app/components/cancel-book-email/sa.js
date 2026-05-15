"use server";

import crypto from "crypto";
import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { sendEmail } from "@/app/lib/resend";

export async function patientResendCancelationEmail(_, formData) {
    try {
        const bookingPubId = formData?.get("bookingPubId");
        if (!bookingPubId) return { ok: false, message: "Missing required fields." };

        const fetchBooking = await db.execute(`SELECT b.*, a.public_id as admin_public_id FROM bookings b JOIN admins a ON b.admin_id = a.id WHERE b.public_id = ?`, [bookingPubId]);
        if (fetchBooking.rows.length === 0) return { ok: false, message: "Booking not found." };

        const booking = fetchBooking.rows[0];

        if (booking.status === "cancelled") return { ok: false, message: "This booking is already cancelled." };
        if (booking.status !== "verified") return { ok: false, message: "You need to verify your email first to cancel the booking." };

        const cancel_token = crypto.randomBytes(32).toString("hex");
        const hashed = await hash(cancel_token);

        await db.execute(`UPDATE bookings SET cancel_token_hash = ?, cancel_token_created_at = CURRENT_TIMESTAMP WHERE id = ?`, [hashed, booking.id]);

        const email = fetchBooking.rows[0].patient_email ? fetchBooking.rows[0].patient_email : null;
        const name = fetchBooking.rows[0].patient_name ? fetchBooking.rows[0].patient_name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Valued Patient";

        if (email) {
            const subject = `Cancel Your Appointment`;
            const to = email;
            const html = `
                        <p>Dear ${name}, You can cancel your appointment.</p >
                        <p>Click on button to cancel your appointment.</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/cancel/${cancel_token}/${bookingPubId}/${booking.admin_public_id}">Cancel Appointment</a>
                        `;

            await sendEmail({ to, subject, html });
        }

        return { ok: true, message: "Cancellation email sent." };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
}