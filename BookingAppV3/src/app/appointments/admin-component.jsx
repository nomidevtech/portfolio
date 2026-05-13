import { db } from "../lib/turso";
import { getMonthName } from "../utils/getDateData";
import { minutesToMeridiem } from "../utils/minutes-to-meridiem";
import { AdminRevokeBooking, AdminRevokeBookings } from "./client";

export default async function AdminComponent({ currentUser }) {


  const fetch = await db.execute(
    `SELECT bookings.*, treatments.name AS treatment_name, treatments.duration AS treatment_duration 
     FROM bookings 
     LEFT JOIN treatments ON bookings.treatment_id = treatments.id 
     WHERE bookings.admin_id = ? AND status NOT IN ('revoked', 'cancelled') 
     ORDER BY booking_date_iso ASC, treatment_start ASC`, 
    [currentUser.admin_id]);
    
  const allBooking = fetch.rows;

  const groupedBooking = allBooking.reduce((acc, booking) => {
    if (!acc[booking.booking_date_iso]) {
      acc[booking.booking_date_iso] = [];
    }
    acc[booking.booking_date_iso].push(booking);
    return acc;
  }, {});


  return (<>
    {Object.keys(groupedBooking).map(dateIso => (
      <div key={dateIso} className="border-2 border-b-amber-100 my-4" >

        <h2>{dateIso.split("-")[2]} {getMonthName(Number(dateIso.split("-")[1]) - 1)} {dateIso.split("-")[0]}</h2>

        <AdminRevokeBookings adminPubId={currentUser.admin_details.public_id} bookingDate={dateIso} />

        <details>
          <summary>Bookings : {groupedBooking[dateIso].length > 9 ? groupedBooking[dateIso].length : "0" + groupedBooking[dateIso].length}</summary>
          {groupedBooking[dateIso].map(booking => (
            <div key={booking.public_id} className="border-2 border-amber-950 my-2" >
              <p>Appointment Date: {booking.date_number > 9 ? booking.date_number : "0" + booking.date_number} {getMonthName(booking.month_number)} {booking.year}</p>
              <p>Timing: {minutesToMeridiem(booking.treatment_start, true)} - {minutesToMeridiem(booking.treatment_end, true)}</p>
              <p>Doctor: {booking.doctor_name ? booking.doctor_name.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ") : "N/A"}</p>
              <p>Treatment: {booking.treatment_name ? booking.treatment_name.split("_").map(word => word[0].toUpperCase() + word.slice(1)).join(" ") : "N/A"}</p>
              <p>Session Duration: {booking.treatment_duration} minutes</p>
              <p>Booking Status: {booking.status[0].toUpperCase() + booking.status.slice(1)}</p>
              <p>Patient Name: {booking?.patient_name ? booking.patient_name.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ") : "N/A"}</p>
              <p>Patient Phone: {booking?.patient_phone ? booking.patient_phone : "N/A"}</p>
              <p>Patient Email: {booking?.patient_email ? booking.patient_email : "N/A"}</p>

              <AdminRevokeBooking adminPubId={currentUser.admin_details.public_id} bookingPubId={booking.public_id} />

            </div>
          ))}
        </details>
      </div>
    ))}
  </>);
}