import EmailVerification from "@/app/components/emailVerification";
import { db } from "@/app/lib/turso";
import { getMonthName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import DownloadTicketButton from "./client";
import { hash } from "@/app/utils/bcrypt";
import { sendEmail } from "@/app/lib/resend";
import crypto from "crypto";

export default async function Message({ params }) {

    const adminId = 1;

    const { bookingPubId } = await params;
    if (!bookingPubId) return <p>Broken link. Booking not found.</p>;

    const fetch = await db.execute(`SELECT * FROM bookings WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);
    if (fetch.rows.length === 0) return <p>Broken link. Booking not found.</p>;

    const booking = fetch.rows[0];

    if (booking.status === "cancelled") return <p>Appointment has been cancelled. Book again.</p>;

    if (booking.status === "verified" && !booking.cancel_token_hash) {

        const cancel_token = crypto.randomBytes(32).toString("hex");
        const hashed = await hash(cancel_token);

        await db.execute(`UPDATE bookings SET cancel_token_hash = ?, cancel_token_created_at = CURRENT_TIMESTAMP WHERE admin_id = ? AND public_id = ?`, [hashed, adminId, bookingPubId]);


        const subject = `Cancel Your Appointment`;
        const to = booking.patient_email;
        const html = `
           <p>You can cancel your appointment.</p>
           <p>Click on button to cancel your appointment.</p>
           <a href="https://portfolio-lw35.vercel.app/cancel/${cancel_token}/${bookingPubId}">Cancel Appointment</a>
           `;

        await sendEmail({ to, subject, html });

    }

    return (<>
        <p>Appointment Date: {booking.date_number > 10 ? booking.date_number : "0" + booking.date_number} {getMonthName(booking.month_number)} {booking.year}</p>
        <p>Timing: {minutesToMeridiem(booking.treatment_start, true)} - {minutesToMeridiem(booking.treatment_end, true)}</p>
        <p>Patient Name: {booking.patient_name?.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}</p>
        <p>Patient Email: {booking.patient_email}</p>
        <p>Patient Phone: {booking.patient_phone}</p>
        {booking.status !== "verified" && <p>You need to verify your email within 30 minutes to book the slot. Otherwise it will be avaliable for others to book again.</p>}
        {booking.status !== "verified" && <EmailVerification bookingPubId={bookingPubId} />}
        {booking.status === "verified" && <><p>Slot Booked Successfully.</p>
            <DownloadTicketButton bookingPubId={bookingPubId} />
        </>}
    </>);
}