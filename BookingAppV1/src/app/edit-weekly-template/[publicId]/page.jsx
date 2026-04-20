import { db } from "../../lib/turso";
import { initBookingsTable } from "../../models/initiTables";
import Client from "./Client";

export default async function EditWeeklyTemplate({ params }) {

    await initBookingsTable();

    const { publicId } = await params;

    const fetch = await db.execute("SELECT * FROM weekly_template WHERE public_id = ?", [publicId]);
    if (fetch.rows.length === 0) return <div>Template not found</div>;

    const template = fetch.rows[0];
    const monthNumber = template.month_number;
    const date = template.date;
    const doctorName = template.doctor_name || "Unavailable";

    const fetchBookings = await db.execute(`SELECT * FROM bookings WHERE month_number = ? AND date = ?`, [monthNumber, date]);
    const bookings = fetchBookings.rows;

    const bookingsArr = [];
    if (bookings.length > 0) {
        for (let booking of bookings) {
            bookingsArr.push({
                date: booking.date,
                start_time: booking.treatment_start,
                end_time: booking.treatment_end,
                treatment: booking.treatment_type,
                patientName: booking.patient_name,
                bookingPublicId: booking.public_id
            });
        };
    };

    const templateSafe = {
        public_id: template.public_id,
        status: template.status,
        doctor_id: template.doctor_id,
        day: template.day,
        day_number: template.day_number,
        month_name: template.month_name,
        date: template.date,
        start_time: template.start_time,
        end_time: template.end_time,
        break_start: template.break_start,
        break_end: template.break_end,
        buffer_minutes: template.buffer_minutes
    }

    return (<>
        <Client template={templateSafe} bookings={bookingsArr} doctorName={doctorName} />
    </>);
}