import { db } from "@/app/lib/turso";
import { getDayName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import Form from "next/form";
import Link from "next/link";
import { updateWeeklyTemplateServerAction } from "./SA";

export default async function EditDoctorTemplate({ params }) {
    const { docPubId, templatePubId } = await params;
    const adminId = 1;

    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE public_id = ?`, [docPubId]);
    if (fetchDoctor.rows.length === 0) return <p>Broken link. Doctor not found.</p>

    const { name, id } = fetchDoctor.rows[0];

    const fetchTemplate = await db.execute(`SELECT * FROM weekly_templates WHERE public_id = ? AND doctor_id = ? AND admin_id = ?`, [templatePubId, id, adminId]);

    if (fetchTemplate.rows.length === 0) return <p>No templates found.  <Link href={`/create-template/${docPubId}`}>Click Here⬅</Link></p>

    let template = fetchTemplate.rows[0];

    console.log(template)

    const dummyHrs = [];
    for (let i = 1; i <= 12; i++) {
        if (i < 10) dummyHrs.push("0" + i);
        else dummyHrs.push(String(i));
    }

    const dummyMinutes = [];
    for (let i = 0; i <= 59; i++) {
        if (i < 10) dummyMinutes.push("0" + i);
        else dummyMinutes.push(String(i));
    }

    const meridiem = ["AM", "PM"];

    return (<>
        <h1>Dr. {name[0].toUpperCase() + name.slice(1)}'s {getDayName(template.day_number)} Template</h1>

        <Form action={updateWeeklyTemplateServerAction}>
            <input type="hidden" name="doctorPublicId" value={docPubId} />
            <input type="hidden" name="templatePublicId" value={templatePubId} />


            <div className="border-2 border-amber-100 p-2 mb-4">
                <label className="block font-bold">Clinic Start</label>
                <select name="startHr" defaultValue={minutesToMeridiem(template.start_time, false).hrs} >
                    {dummyHrs.map((hr) => (
                        <option value={hr} key={hr}>
                            {hr}
                        </option>
                    ))}
                </select>
                <select name="startMin" defaultValue={minutesToMeridiem(template.start_time, false).mins}>
                    {dummyMinutes.map((min) => (
                        <option value={min} key={min}>
                            {min}
                        </option>
                    ))}
                </select>
                <select name="startMeridiem" defaultValue={minutesToMeridiem(template.start_time, false).meridiem}>
                    {meridiem.map((mer) => (
                        <option value={mer} key={mer}>
                            {mer}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-2 border-amber-100 p-2 mb-4">
                <label className="block font-bold">Clinic End</label>
                <select name="endHr" defaultValue={minutesToMeridiem(template.end_time, false).hrs} >
                    {dummyHrs.map((hr) => (
                        <option value={hr} key={hr}>
                            {hr}
                        </option>
                    ))}
                </select>
                <select name="endMin" defaultValue={minutesToMeridiem(template.end_time, false).mins}>
                    {dummyMinutes.map((min) => (
                        <option value={min} key={min}>
                            {min}
                        </option>
                    ))}
                </select>
                <select name="endMeridiem" defaultValue={minutesToMeridiem(template.end_time, false).meridiem}>
                    {meridiem.map((mer) => (
                        <option value={mer} key={mer}>
                            {mer}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-2 border-blue-100 p-2 mb-4">
                <label className="block font-bold">Break Start</label>
                <select name="breakStartHr" defaultValue={minutesToMeridiem(template.break_start, false).hrs} >
                    {dummyHrs.map((hr) => (
                        <option value={hr} key={hr}>
                            {hr}
                        </option>
                    ))}
                </select>
                <select name="breakStartMin" defaultValue={minutesToMeridiem(template.break_start, false).mins}>
                    {dummyMinutes.map((min) => (
                        <option value={min} key={min}>
                            {min}
                        </option>
                    ))}
                </select>
                <select name="breakStartMeridiem" defaultValue={minutesToMeridiem(template.break_start, false).meridiem}>
                    {meridiem.map((mer) => (
                        <option value={mer} key={mer}>
                            {mer}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-2 border-blue-100 p-2 mb-4">
                <label className="block font-bold">Break End</label>
                <select name="breakEndHr" defaultValue={minutesToMeridiem(template.break_end, false).hrs} >
                    {dummyHrs.map((hr) => (
                        <option value={hr} key={hr}>
                            {hr}
                        </option>
                    ))}
                </select>
                <select name="breakEndMin" defaultValue={minutesToMeridiem(template.break_end, false).mins}>
                    {dummyMinutes.map((min) => (
                        <option value={min} key={min}>
                            {min}
                        </option>
                    ))}
                </select>
                <select name="breakEndMeridiem" defaultValue={minutesToMeridiem(template.break_end, false).meridiem}>
                    {meridiem.map((mer) => (
                        <option value={mer} key={mer}>
                            {mer}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-2 border-blue-100 p-2 mb-4">
                <label className="block font-bold">Buffer Minutes</label>
                <input  type="text" name="buffer" defaultValue={template.buffer_minutes} />
            </div>

            <button type="submit">Update</button>
        </Form>

    </>);
}