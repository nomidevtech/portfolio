import { db } from "../../lib/turso";
import Link from "next/link";

import Client from "./Client";

export default async function ManageWeeklyTemplate({ params }) {

    const { publicId } = await params;

    const d = new Date();
    const currentMonthNumber = d.getMonth();

    const fetchDocId = await db.execute("SELECT id FROM doctors WHERE public_id = ?", [publicId]);

    if (fetchDocId.rows.length === 0) return <div>Doctor not found</div>;

    const doctorId = fetchDocId.rows[0].id;

    const fetchTemplates = await db.execute(`SELECT * FROM weekly_template WHERE doctor_id = ? AND month_number = ?`, [doctorId, currentMonthNumber]);
    const templates = fetchTemplates.rows;
    const allDaysFromDb = fetchTemplates.rows?.map(row => row.day);
    const uniqueDaysFromDb = [...new Set(allDaysFromDb)];

    const fetchBookings = await db.execute(`SELECT * FROM bookings WHERE month_number = ?`, [currentMonthNumber]);
    const bookings = fetchBookings.rows;

    const allWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const nonTemplateDays = allWeekDays.filter(fn => !uniqueDaysFromDb.includes(fn.toLowerCase()));


    const bookingsArr = [];
    if (bookings.length > 0) {
        for (let booking of bookings) {
            bookingsArr.push({ date: booking.date });
        }
    }

    const templatesForClient = [];
    if (templates.length > 0) {
        for (let template of templates) {
            templatesForClient.push({
                public_id: template.public_id,
                status: template.status,
                day: template.day,
                day_number: template.day_number,
                month_name: template.month_name,
                month_number: template.month_number,
                year: template.year,
                date: template.date,
                start_time: template.start_time,
                end_time: template.end_time,
                break_start: template.break_start,
                break_end: template.break_end,
                buffer_minutes: template.buffer_minutes
            });
        }
    }


    //console.log("i am templates ", templates);

    return (
        <>
            {nonTemplateDays.length > 0 &&
                nonTemplateDays.map(day =>
                    <div key={day}>{day}
                        <Link href={`/manage-weekly-template/${publicId}/${day}`}>Add</Link>
                    </div>
                )}

            <Client templates={templatesForClient} publicId={publicId} bookings={bookingsArr} />
        </>
    );
}




