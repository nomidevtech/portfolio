import { db } from "../lib/turso";
import { getMonthName } from "../utils/getDateData";
import { minutesToMeridiem } from "../utils/minutes-to-meridiem";
import { DoctorRevokeBooking, DoctorRevokeBookings } from "./client";

export default async function DoctorComponent({ currentUser }) {

    const fetch = await db.execute(
        `SELECT bookings.*, treatments.name AS treatment_name, treatments.duration AS treatment_duration
         FROM bookings
         LEFT JOIN treatments ON bookings.treatment_id = treatments.id
         WHERE bookings.doctor_id = ? AND status NOT IN ('revoked', 'cancelled')
         ORDER BY booking_date_iso ASC`,
        [currentUser.doctor_id]
    );

    const allBookings = fetch.rows;

    const groupedBookings = allBookings.reduce((acc, booking) => {
        if (!acc[booking.booking_date_iso]) {
            acc[booking.booking_date_iso] = [];
        }
        acc[booking.booking_date_iso].push(booking);
        return acc;
    }, {});

    return (
        <>
            {Object.keys(groupedBookings).map(dateIso => (
                <div key={dateIso} className="border-2 border-b-amber-100 my-4">

                    <h2>
                        {dateIso.split("-")[2]}{" "}
                        {getMonthName(Number(dateIso.split("-")[1]) - 1)}{" "}
                        {dateIso.split("-")[0]}
                    </h2>

                    <DoctorRevokeBookings
                        doctorPubId={currentUser.doctor_details.public_id}
                        bookingDate={dateIso}
                    />

                    {groupedBookings[dateIso].map(booking => (
                        <div key={booking.public_id} className="border-2 border-amber-950 my-2">
                            <p>Appointment Date: {booking.date_number > 9 ? booking.date_number : "0" + booking.date_number} {getMonthName(booking.month_number)} {booking.year}</p>
                            <p>Timing: {minutesToMeridiem(booking.treatment_start, true)} - {minutesToMeridiem(booking.treatment_end, true)}</p>
                            <p>Patient: {booking.patient_name}</p>
                            <p>Treatment: {booking.treatment_name}</p>
                            <p>Session Duration: {booking.treatment_duration} minutes</p>
                            <p>Booking Status: {booking.status}</p>

                            <DoctorRevokeBooking
                                doctorPubId={currentUser.doctor_details.public_id}
                                bookingPubId={booking.public_id}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </>
    );
}