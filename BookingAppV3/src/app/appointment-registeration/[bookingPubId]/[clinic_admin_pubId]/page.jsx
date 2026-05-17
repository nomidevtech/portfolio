import { db } from "@/app/lib/turso";
import ClientAppointmentRegisteration from "./client";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import { getMonthName } from "@/app/utils/getDateData";

export const metadata = {
    title: "Register Appointment",
    description: "Complete patient details for a reserved appointment slot.",
};

export default async function AppointmentRegisteration({ params }) {



    const { bookingPubId, clinic_admin_pubId } = await params;
    if (!bookingPubId || !clinic_admin_pubId) return <main className="page-shell"><p className="status-error">Broken link. Booking not found.</p></main>;

    const fetchAdmin = await db.execute(`SELECT * FROM admins WHERE public_id = ?`, [clinic_admin_pubId]);
    if (fetchAdmin.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Booking not found.</p></main>;

    const adminId = fetchAdmin.rows[0].id;

    const fetchBooking = await db.execute(`SELECT * FROM bookings WHERE public_id = ? AND admin_id = ?`, [bookingPubId, adminId]);
    if (fetchBooking.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Booking not found.</p></main>;

    const booking = fetchBooking.rows[0];

    if (booking.status !== 'pending') return <main className="page-shell"><p className="status-warning">This slot is no longer available.</p></main>

    const [fetchDoctor, fetchTreatment] = await Promise.all([
        db.execute(`SELECT * FROM doctors WHERE id = ?`, [booking.doctor_id]),
        db.execute(`SELECT * FROM treatments WHERE id = ?`, [booking.treatment_id])
    ]);

    if (fetchDoctor.rows.length === 0 || fetchTreatment.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Booking not found.</p></main>;

    return (<main className="page-shell-narrow">
        <div className="mb-8">
            <p className="soft-pill">Patient booking</p>
            <h1 className="mt-4 text-3xl font-black text-slate-950">Register appointment</h1>
            <p className="mt-2 text-slate-600">Confirm your details to complete this booking request.</p>
        </div>
        <section className="section-panel mb-6">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Date" value={`${booking.date_number > 9 ? booking.date_number : "0" + booking.date_number} ${getMonthName(booking.month_number)} ${booking.year}`} />
                <Info label="Timing" value={`${minutesToMeridiem(booking.treatment_start, true)} - ${minutesToMeridiem(booking.treatment_end, true)}`} />
                <Info label="Doctor" value={fetchDoctor.rows[0].name.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")} />
                <Info label="Treatment" value={fetchTreatment.rows[0].name.split("_").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")} />
                <Info label="Duration" value={`${fetchTreatment.rows[0].duration} minutes`} />
            </dl>
        </section>

        <ClientAppointmentRegisteration bookingPubId={bookingPubId} adminPubId={clinic_admin_pubId} />
    </main>);
}

function Info({ label, value }) {
    return <div className="rounded-2xl bg-emerald-50 p-4"><dt className="font-bold text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-950">{value}</dd></div>;
}
