import Link from "next/link";
import { db } from "../lib/turso";
import { minutesToMeridiem } from "../utils/minutes-to-meridiem";
import { initWeeklyTempelateTalbe } from "../models/initiTables";


export default async function SessionManagment() {

    await initWeeklyTempelateTalbe();

    const fetchRecord = await db.execute(`SELECT day, start_time AS start, end_time AS end, break_start AS breakStart, break_end AS breakEnd, buffer_minutes AS buffer FROM weekly_template;`);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let currentSlots = [];

    if (fetchRecord.rows.length > 0) {
        currentSlots = fetchRecord.rows
            .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day))
            .map((record) => ({
                day: record.day,
                start: minutesToMeridiem(record.start, true),
                end: minutesToMeridiem(record.end, true),
                breakStart: minutesToMeridiem(record.breakStart, true),
                breakEnd: minutesToMeridiem(record.breakEnd, true),
                buffer: record.buffer
            }));
    }


    console.log(currentSlots);


    const daysWithoutSlots = days.filter((day) => !currentSlots.find((slot) => slot.day === day));
    console.log(daysWithoutSlots);




    return (<>
        <h2>Generate Slots</h2>
        {daysWithoutSlots.map((day) => (
            <div key={day} className="border-2 m-4">
                <span>{day} </span>
                <Link href={`/manage-weekly-template/day?d=${day}`}>Generate</Link>
            </div>
        ))}
        <div>
            <h2>Current Slots </h2>
            {currentSlots.map((daySlot) => (
                <div key={daySlot.day} className="border-2 m-4">
                    <div>{daySlot.day} </div>
                    <div>Clinic Time: {daySlot.start} - {daySlot.end}</div>
                    <div>Break Time: {daySlot.breakStart} - {daySlot.breakEnd}</div>
                    <div>Buffer: {daySlot.buffer} Min</div>
                    <Link href={`/manage-weekly-template/day?d=${daySlot.day}&edit=true`}>Edit</Link>
                </div>
            ))}
        </div>


    </>);
}


