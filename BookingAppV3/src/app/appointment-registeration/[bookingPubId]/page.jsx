import { db } from "@/app/lib/turso";
import ClientAppointmentRegisteration from "./client";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import { getMonthName } from "@/app/utils/getDateData";

export default async function AppointmentRegisteration({ params }) {

    const adminId = 1;

    const { bookingPubId } = await params;
    if (!bookingPubId) return <p>Broken link. Booking not found.</p>;

    const fetchBooking = await db.execute(`SELECT * FROM bookings WHERE public_id = ? AND admin_id = ?`, [bookingPubId, adminId]);
    if (fetchBooking.rows.length === 0) return <p>Broken link. Booking not found.</p>;

    const booking = fetchBooking.rows[0];

    const [fetchDoctor, fetchTreatment] = await Promise.all([
        db.execute(`SELECT * FROM doctors WHERE id = ?`, [booking.doctor_id]),
        db.execute(`SELECT * FROM treatments WHERE id = ?`, [booking.treatment_id])
    ]);

    if (fetchDoctor.rows.length === 0 || fetchTreatment.rows.length === 0) return <p>Broken link. Booking not found.</p>;

    return (<>
        <p>Appointment Date: {booking.date_number > 10 ? booking.date_number : "0" + booking.date_number} {getMonthName(booking.month_number)} {booking.year}</p>
        <p>Timing: {minutesToMeridiem(booking.treatment_start, true)} - {minutesToMeridiem(booking.treatment_end, true)}</p>
        <p>Doctor: {fetchDoctor.rows[0].name.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}</p><p>Treatment: {fetchTreatment.rows[0].name.split("_").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}</p>
        <p>Session Duration: {fetchTreatment.rows[0].duration} minutes</p>

        <ClientAppointmentRegisteration bookingPubId={bookingPubId} />
    </>);
}