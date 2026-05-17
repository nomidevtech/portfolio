import { getUserPlus } from "../lib/getUser";
import { db } from "../lib/turso";
import { getDayName, getMonthName } from "../utils/getDateData";
import { minutesToMeridiem } from "../utils/minutes-to-meridiem";
import { ToggleSlotButton, EditSlotButton } from "./Client";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Generated Slots",
    description: "Manage generated appointment slots and future availability.",
};

export default async function GeneratedSlots() {
    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const fetch = await db.execute(
        `SELECT slots.*, GROUP_CONCAT(bookings.patient_email, ' | ') AS patients FROM slots LEFT JOIN bookings ON bookings.admin_id = slots.admin_id AND bookings.date_number = slots.date_number AND bookings.month_number = slots.month_number AND bookings.year = slots.year AND bookings.doctor_id = slots.doctor_id AND bookings.status = 'verified' WHERE slots.admin_id = ? AND full_date_at_period >= DATE('now') GROUP BY slots.id ORDER BY full_date_at_period`,
        [adminId]
    );

    if (fetch.rows.length === 0) {
        return <main className="page-shell"><p className="status-warning">No slots available. Go to create template to generate.</p></main>;
    }

    const doctorIds = [...new Set(fetch.rows.map(doc => doc.doctor_id))];
    const placeHolders = doctorIds.map(() => "?").join(',');
    const doctorsResult = await db.execute(`SELECT * FROM doctors WHERE id IN (${placeHolders})`, doctorIds);
    const doctors = doctorsResult.rows;

    function countBookings(patientsStr) {
        if (!patientsStr) return 0;
        return patientsStr.split(' | ').length;
    }

    return (
        <main className="page-shell">
            <div className="mb-8">
                <p className="soft-pill">Availability control</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">Generated slots</h1>
                <p className="mt-2 text-slate-600">Review upcoming generated slots, status, and active booking counts.</p>
            </div>

            <div className="grid gap-5">
                {doctors.map(doc => (
                    <section key={doc.public_id} className="section-panel">
                        <h2 className="text-xl font-black text-slate-950">Dr. {doc.name[0].toUpperCase() + doc.name.slice(1)}</h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{doc.department} Department</p>
                        <details className="mt-5">
                            <summary>Slots</summary>
                            <div className="mt-4 grid gap-4">
                                {fetch.rows.filter(fn1 => fn1.doctor_id === doc.id).map(fn2 => {
                                    const bookingCount = countBookings(fn2.patients);
                                    return (
                                        <div key={fn2.public_id} className="data-card">
                                            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-950">{getMonthName(fn2.month_number)} {fn2.date_number > 9 ? fn2.date_number : `0${fn2.date_number}`}, {getDayName(fn2.day_number)}</h3>
                                                    <p className="mt-2 text-sm text-slate-600">Clinic: {minutesToMeridiem(fn2.start_time, true)} - {minutesToMeridiem(fn2.end_time, true)}</p>
                                                    <p className="text-sm text-slate-600">Break: {minutesToMeridiem(fn2.break_start, true)} - {minutesToMeridiem(fn2.break_end, true)}</p>
                                                    <p className="text-sm text-slate-600">Buffer: {fn2.buffer_minutes ? fn2.buffer_minutes : 0} minutes</p>
                                                </div>
                                                <div className="grid gap-2 text-sm md:text-right">
                                                    <span className="soft-pill capitalize">{fn2.status}</span>
                                                    <span className="font-semibold text-slate-600">Bookings: {bookingCount > 9 ? bookingCount : "0" + bookingCount}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <ToggleSlotButton slotPubId={fn2.public_id} status={fn2.status} numberOfBookings={bookingCount} />
                                                <EditSlotButton slotPubId={fn2.public_id} numberOfBookings={bookingCount} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </details>
                    </section>
                ))}
            </div>
        </main>
    );
}
