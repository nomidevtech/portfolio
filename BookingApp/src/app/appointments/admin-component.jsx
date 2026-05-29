import { db } from "../lib/turso";
import { capitalizeLabel, fromHyphenSlug, fromUnderscoreSlug } from "../utils/displaySlug";
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

  const groupedBooking = fetch.rows.reduce((acc, booking) => {
    if (!acc[booking.booking_date_iso]) acc[booking.booking_date_iso] = [];
    acc[booking.booking_date_iso].push(booking);
    return acc;
  }, {});

  return (
    <main className="page-shell">
      <div className="mb-8">
        <p className="soft-pill">Clinic operations</p>
        <h1 className="mt-4 text-3xl font-black text-slate-950">Appointments</h1>
        <p className="mt-2 text-slate-600">Review active bookings by appointment date.</p>
      </div>

      <div className="grid gap-5">
        {Object.keys(groupedBooking).length > 0 ? Object.keys(groupedBooking).map(dateIso => (
          <section key={dateIso} className="section-panel">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">{dateIso.split("-")[2]} {getMonthName(Number(dateIso.split("-")[1]) - 1)} {dateIso.split("-")[0]}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Bookings: {groupedBooking[dateIso].length > 9 ? groupedBooking[dateIso].length : "0" + groupedBooking[dateIso].length}</p>
              </div>
              <AdminRevokeBookings adminPubId={currentUser.admin_details.public_id} bookingDate={dateIso} />
            </div>

            <details className="mt-5">
              <summary>View bookings</summary>
              <div className="mt-4 grid gap-4">
                {groupedBooking[dateIso].map(booking => (
                  <div key={booking.public_id} className="data-card">
                    <span className={`soft-pill capitalize ${booking.status === 'verified' ? 'bg-emerald-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
                      {booking.status}
                    </span>
                    <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                      <Info label="Date" value={`${booking.date_number > 9 ? booking.date_number : "0" + booking.date_number} ${getMonthName(booking.month_number)} ${booking.year}`} />
                      <Info label="Timing" value={`${minutesToMeridiem(booking.treatment_start, true)} - ${minutesToMeridiem(booking.treatment_end, true)}`} />
                      <Info label="Doctor" value={fromHyphenSlug(booking.doctor_name, "N/A")} />
                      <Info label="Treatment" value={fromUnderscoreSlug(booking.treatment_name, "N/A")} />
                      <Info label="Duration" value={`${booking.treatment_duration} minutes`} />
                      <Info label="Status" value={capitalizeLabel(booking.status)} />
                      <Info label="Patient" value={fromHyphenSlug(booking.patient_name, "N/A")} />
                      <Info label="Phone" value={booking?.patient_phone || "N/A"} />
                      <Info label="Email" value={booking?.patient_email || "N/A"} />
                    </dl>
                    <AdminRevokeBooking adminPubId={currentUser.admin_details.public_id} bookingPubId={booking.public_id} />
                  </div>
                ))}
              </div>
            </details>
          </section>
        )) : <p className="section-panel text-slate-600">No active appointments found.</p>}
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
