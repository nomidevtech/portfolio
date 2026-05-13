import { getUserPlus } from "../lib/getUser";
import { db } from "../lib/turso";
import { getDayName, getMonthName } from "../utils/getDateData";
import { minutesToMeridiem } from "../utils/minutes-to-meridiem";
import { ToggleSlotButton, EditSlotButton } from "./Client";
import { redirect } from "next/navigation";

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
        return <p>No slots available. Go to create template to generate.</p>;
    }

    const doctorIds = [...new Set(fetch.rows.map(doc => doc.doctor_id))];
    const placeHolders = doctorIds.map(() => "?").join(',');

    const doctorsResult = await db.execute(
        `SELECT * FROM doctors WHERE id IN (${placeHolders})`,
        doctorIds
    );

    const doctors = doctorsResult.rows;

    // Helper: count bookings from the GROUP_CONCAT string using the correct separator
    function countBookings(patientsStr) {
        if (!patientsStr) return 0;
        return patientsStr.split(' | ').length;
    }

    return (
        <>
            {doctors.length > 0 &&
                <div>
                    {doctors.map(doc => (
                        <div key={doc.public_id}>
                            <h2>Dr. {doc.name[0].toUpperCase() + doc.name.slice(1)} From {doc.department} Department</h2>
                            <details>
                                <summary>Slots</summary>
                                {fetch.rows.filter(fn1 => fn1.doctor_id === doc.id).map(fn2 => {
                                    const bookingCount = countBookings(fn2.patients);
                                    return (
                                        <div key={fn2.public_id} className="border-2">
                                            <p>{getMonthName(fn2.month_number)} {fn2.date_number > 9 ? fn2.date_number : `0${fn2.date_number}`} {getDayName(fn2.day_number)}</p>
                                            <p>Clinic: {minutesToMeridiem(fn2.start_time, true)} - {minutesToMeridiem(fn2.end_time, true)}</p>
                                            <p>Break: {minutesToMeridiem(fn2.break_start, true)} - {minutesToMeridiem(fn2.break_end, true)}</p>
                                            <p>Buffer: {fn2.buffer_minutes ? fn2.buffer_minutes : 0} minutes</p>
                                            <p>Status: {fn2.status[0].toUpperCase() + fn2.status.slice(1)}</p>
                                            <p>Number of Bookings: {bookingCount > 9 ? bookingCount : "0" + bookingCount}</p>
                                            <ToggleSlotButton slotPubId={fn2.public_id} status={fn2.status} numberOfBookings={bookingCount} />
                                            <div><EditSlotButton slotPubId={fn2.public_id} numberOfBookings={bookingCount} /></div>
                                        </div>
                                    );
                                })}
                            </details>
                        </div>
                    ))}
                </div>}
        </>
    );
}