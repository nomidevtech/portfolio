import { db } from "@/app/lib/turso";
import { getDayName, getMonthName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import Form from "next/form";
import { editSlotServerAction } from "./sa";
import { rollingWindow } from "@/app/lib/rollingWindow";

export default async function EditSlot({ params }) {

    await rollingWindow();

    const { pubId } = await params;
    const adminId = 1;

    const fetchSlot = await db.execute(`SELECT * FROM slots WHERE public_id = ? AND admin_id = ?`, [pubId, adminId]);

    if (fetchSlot.rows.length === 0) return <p>Broken link. Slot not found.</p>

    const { public_id, doctor_id, status, day_number, month_number, year, date_number, start_time, end_time, break_start, break_end, buffer_minutes } = fetchSlot.rows[0];

    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE id = ?`, [doctor_id]);

    if (fetchDoctor.rows.length === 0) return <p>Broken link. Doctor not found.</p>

    const { name, department } = fetchDoctor.rows[0];

    const dummyHrs = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const dummyMinutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const meridiem = ["AM", "PM"];
    const statusArr = ["active", "inactive"];

    return (<>
        <h1>Slot: {getDayName(day_number)} {getMonthName(month_number)} {date_number >= 10 ? date_number : '0' + date_number} {year} For Dr. {name[0].toUpperCase() + name.slice(1)} From {department} Department </h1>

        <Form action={editSlotServerAction}>
            <input type="hidden" name="slotPubId" value={public_id} />

            <div className="border-2 border-amber-100 p-2 mb-4">
                <label className="block font-bold">Status</label>
                <select name="status" defaultValue={status}>
                    {statusArr.map((fn) => (
                        <option value={fn} key={fn}>
                            {fn[0].toUpperCase() + fn.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-2 border-amber-100 p-2 mb-4">
                <label className="block font-bold">Clinic Start</label>
                <select name="startHr" defaultValue={minutesToMeridiem(start_time, false).hrs} >
                    {dummyHrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}
                </select>
                <select name="startMin" defaultValue={minutesToMeridiem(start_time, false).mins}>
                    {dummyMinutes.map((min) => <option value={min} key={min}>{min}</option>)}
                </select>
                <select name="startMeridiem" defaultValue={minutesToMeridiem(start_time, false).meridiem}>
                    {meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}
                </select>
            </div>

            <div className="border-2 border-amber-100 p-2 mb-4">
                <label className="block font-bold">Clinic End</label>
                <select name="endHr" defaultValue={minutesToMeridiem(end_time, false).hrs} >
                    {dummyHrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}
                </select>
                <select name="endMin" defaultValue={minutesToMeridiem(end_time, false).mins}>
                    {dummyMinutes.map((min) => <option value={min} key={min}>{min}</option>)}
                </select>
                <select name="endMeridiem" defaultValue={minutesToMeridiem(end_time, false).meridiem}>
                    {meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}
                </select>
            </div>

            <div className="border-2 border-blue-100 p-2 mb-4">
                <label className="block font-bold">Break Start</label>
                <select name="breakStartHr" defaultValue={minutesToMeridiem(break_start, false).hrs} >
                    {dummyHrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}
                </select>
                <select name="breakStartMin" defaultValue={minutesToMeridiem(break_start, false).mins}>
                    {dummyMinutes.map((min) => <option value={min} key={min}>{min}</option>)}
                </select>
                <select name="breakStartMeridiem" defaultValue={minutesToMeridiem(break_start, false).meridiem}>
                    {meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}
                </select>
            </div>

            <div className="border-2 border-blue-100 p-2 mb-4">
                <label className="block font-bold">Break End</label>
                <select name="breakEndHr" defaultValue={minutesToMeridiem(break_end, false).hrs} >
                    {dummyHrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}
                </select>
                <select name="breakEndMin" defaultValue={minutesToMeridiem(break_end, false).mins}>
                    {dummyMinutes.map((min) => <option value={min} key={min}>{min}</option>)}
                </select>
                <select name="breakEndMeridiem" defaultValue={minutesToMeridiem(break_end, false).meridiem}>
                    {meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}
                </select>
            </div>

            <div className="border-2 border-blue-100 p-2 mb-4">
                <label className="block font-bold">Buffer Minutes</label>
                <input type="number" name="buffer" defaultValue={buffer_minutes} />
            </div>

            <button type="submit">Update</button>
        </Form>
    </>);
}