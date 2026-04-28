import { db } from "@/app/lib/turso";
import { getMonthName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";

export default async function Message({ params }) {

    const { bookingPubId } = await params;
    if (!bookingPubId) return <p>Broken link. Booking not found.</p>;

    const fetch = await db.execute(`SELECT * FROM bookings WHERE public_id = ?`, [bookingPubId]);
    if (fetch.rows.length === 0) return <p>Broken link. Booking not found.</p>;

    const booking = fetch.rows[0];

    console.log(fetch.rows)

    return (<>
        <p>Appointment Date: {booking.date_number > 10 ? booking.date_number : "0" + booking.date_number} {getMonthName(booking.month_number)} {booking.year}</p>
        <p>Timing: {minutesToMeridiem(booking.treatment_start, true)} - {minutesToMeridiem(booking.treatment_end, true)}</p>
        <p>Patient Name: {booking.patient_name?.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}</p>
        <p>Patient Email: {booking.patient_email}</p>
        <p>Patient Phone: {booking.patient_phone}</p>

    </>);
}