import { PatientEmailVerification } from "@/app/components/emailVerification";
import { db } from "@/app/lib/turso";
import { getMonthName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import DownloadTicketButton from "./client";
import { redisIpLimit } from "@/app/lib/redis";

export default async function Message({ params }) {

    const redisLimit = await redisIpLimit(20, "message", 60 * 15);
    if (!redisLimit.ok) return <p>{redisLimit.message}</p>

    const { bookingPubId, adminPubId } = await params;
    if (!bookingPubId || !adminPubId) return <p>Broken link. Booking not found.</p>;

    const fetchAdmin = await db.execute(`SELECT id FROM admins WHERE public_id = ?`, [adminPubId]);
    if (fetchAdmin.rows.length === 0) return <p>Broken link. Booking not found.</p>;

    const adminId = fetchAdmin.rows[0].id;

    const fetch = await db.execute(`SELECT * FROM bookings WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);
    if (fetch.rows.length === 0) return <p>Broken link. Booking not found.</p>;

    const booking = fetch.rows[0];

    if (booking.status === "cancelled") return <p>You have cancelled this booking. Please Book again.</p>;
    if (booking.status === "revoked") return <p>Appointment has been revoked by the clinic. We are sorry for the inconvenience. Please Book again.</p>;



    return (<>
        <p>Appointment Date: {booking.date_number > 9 ? booking.date_number : "0" + booking.date_number} {getMonthName(booking.month_number)} {booking.year}</p>
        <p>Timing: {minutesToMeridiem(booking.treatment_start, true)} - {minutesToMeridiem(booking.treatment_end, true)}</p>
        <p>Patient Name: {booking.patient_name?.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}</p>
        <p>Patient Email: {booking.patient_email}</p>
        <p>Patient Phone: {booking.patient_phone}</p>
        {booking.status !== "verified" && <p>You need to verify your email within 30 minutes to book the slot. Otherwise it will be avaliable for others to book again.</p>}
        {booking.status !== "verified" && <PatientEmailVerification bookingPubId={bookingPubId} adminPubId={adminPubId} />}
        {booking.status === "verified" && <><p>Slot Booked Successfully.</p>
            <DownloadTicketButton bookingPubId={bookingPubId} adminPubId={adminPubId} />
        </>}
    </>);
}