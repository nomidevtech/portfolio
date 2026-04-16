import { db } from "../../lib/turso";
import Link from "next/link";
import { minutesToMeridiem } from "../../utils/minutes-to-meridiem";

export default async function CreateWeeklyTemplate({ params }) {

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

    const allWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const nonTemplateDays = allWeekDays.filter(fn => !uniqueDaysFromDb.includes(fn.toLocaleLowerCase()));







    console.log(templates);
    return (
        <>
            {nonTemplateDays.length > 0 &&
                nonTemplateDays.map(day =>
                    <div key={day}>{day}
                        <Link href={`/create-weekly-template/${publicId}/${day}`}>Add</Link>
                    </div>
                )}


            {templates.length > 0 && templates.map((template) => (
                <div key={template.public_id} className="border-2 ">
                    <p>{template.day[0].toUpperCase() + template.day.slice(1)}</p>
                    <p>{template.month_name[0].toUpperCase() + template.month_name.slice(1)} {template.date < 10 ? "0" + template.date : template.date}</p>
                    <p>Status: {template.status === 0 ? "Inactive" : "Active"}</p>
                    <p>Clinic: {minutesToMeridiem(template.start_time, true)} - {minutesToMeridiem(template.end_time, true)}</p>
                    <p>Break: {minutesToMeridiem(template.break_start, true)} - {minutesToMeridiem(template.break_end, true)}</p>
                    <p>Buffer: {template.buffer_minutes} Minutes</p>

                </div>
            ))}

        </>
    );
}




