import Form from "next/form";
import { db } from "@/app/lib/turso";
import { createTemplateServerAction } from "./SA";
import { getDayName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import Link from "next/link";
import { getUserPlus } from "@/app/lib/getUser";
import { redirect } from "next/navigation";
import { DeleteTemplateButton } from "@/app/components/DeleteTemplateButton";


export default async function DoctorCreateTemplate({ params }) {

    const currentUser = await getUserPlus();
    if (!currentUser) return redirect("/login");
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id || currentUser.status !== "verified") redirect(`/verification/${currentUser?.admin_details?.public_id}`);
    const adminId = currentUser.admin_id;

    const { docPubId } = await params;

    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE public_id = ? AND admin_id = ?`, [docPubId, adminId]);
    if (fetchDoctor.rows.length === 0) return <p>Broken link. Doctor not found.</p>

    const { name, id } = fetchDoctor.rows[0];

    const fetchExisTemplates = await db.execute(`SELECT * FROM weekly_templates WHERE doctor_id = ? AND admin_id = ?`, [id, adminId]);

    let currentTemplates = fetchExisTemplates.rows.length > 0 ? fetchExisTemplates.rows : [];

    currentTemplates = currentTemplates?.sort((a, b) => a.day_number - b.day_number);

    const existDays = fetchExisTemplates.rows.map(fn => (
        getDayName(fn.day_number)
    ));

    let defaultBuffer = 10;
    let defaultStartHr = "09";
    let defaultStartMin = "00";
    let defaultStartMeridiem = "AM";
    let defaultEndHr = "05";
    let defaultEndMin = "00";
    let defaultEndMeridiem = "PM";
    let defaultBreakStartHr = "12";
    let defaultBreakStartMin = "00";
    let defaultBreakStartMeridiem = "PM";
    let defaultBreakEndHr = "01";
    let defaultBreakEndMin = "00";
    let defaultBreakEndMeridiem = "PM";

    const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const nonTemplateDays = allDays.filter(day => !existDays.includes(day));

    let days = nonTemplateDays.length === 0 ? allDays : nonTemplateDays;

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
        <div>
            <h2>{`Dr. ${name.split("-").map(fn => fn[0].toUpperCase() + fn.slice(1)).join(" ")}`}</h2>
            <h2> Department: {fetchDoctor.rows[0].department.split(" ").map(fn => fn[0].toUpperCase() + fn.slice(1)).join(" ")}</h2>
            {currentTemplates.length > 0 && <>
                {currentTemplates.map(temp => (
                    <div key={temp.public_id} className="border-2 border-amber-50" >
                        <p>Template Day: {getDayName(temp.day_number)}</p>
                        <p>Clinic Time: {minutesToMeridiem(temp.start_time, true)} - {minutesToMeridiem(temp.end_time, true)}</p>
                        <p>Break Duration: {minutesToMeridiem(temp.break_start, true)} - {minutesToMeridiem(temp.break_end, true)}</p>
                        <p>Buffer: {temp.buffer_minutes} minutes</p>
                        <Link href={`/edit-template/${docPubId}/${temp.public_id}`}>Edit⬅</Link>

                        <DeleteTemplateButton
                            templatePubId={temp.public_id}
                            docPubId={docPubId}
                            dayName={getDayName(temp.day_number)}
                        />
                    </div>
                ))}
            </>}
        </div>

        <h1>Create New Template for Dr. {name[0].toUpperCase() + name.slice(1)}</h1>
        <Form action={createTemplateServerAction} className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-md">
            <input type="hidden" name="doctorPublicId" value={docPubId} />
            <select name="day" >
                {days.map((day) => (
                    <option value={day} key={day}>
                        {day}
                    </option>
                ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Buffer in minutes
            </label>
            <input type="number" name="buffer" defaultValue={defaultBuffer} />

            <div className="border-2 border-amber-100 p-2 mb-4">
                <label className="block font-bold">Clinic Start</label>
                <select name="startHr" defaultValue={defaultStartHr}>
                    {dummyHrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}
                </select>
                <select name="startMin" defaultValue={defaultStartMin}>
                    {dummyMinutes.map((min) => <option value={min} key={min}>{min}</option>)}
                </select>
                <select name="startMeridiem" defaultValue={defaultStartMeridiem}>
                    {meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}
                </select>
            </div>

            <div className="border-2 border-amber-100 p-2 mb-4">
                <label className="block font-bold">Clinic End</label>
                <select name="endHr" defaultValue={defaultEndHr}>
                    {dummyHrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}
                </select>
                <select name="endMin" defaultValue={defaultEndMin}>
                    {dummyMinutes.map((min) => <option value={min} key={min}>{min}</option>)}
                </select>
                <select name="endMeridiem" defaultValue={defaultEndMeridiem}>
                    {meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}
                </select>
            </div>

            <div className="border-2 border-blue-100 p-2 mb-4">
                <label className="block font-bold">Break Start</label>
                <select name="breakStartHr" defaultValue={defaultBreakStartHr}>
                    {dummyHrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}
                </select>
                <select name="breakStartMin" defaultValue={defaultBreakStartMin}>
                    {dummyMinutes.map((min) => <option value={min} key={min}>{min}</option>)}
                </select>
                <select name="breakStartMeridiem" defaultValue={defaultBreakStartMeridiem}>
                    {meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}
                </select>
            </div>

            <div className="border-2 border-blue-100 p-2 mb-4">
                <label className="block font-bold">Break End</label>
                <select name="breakEndHr" defaultValue={defaultBreakEndHr}>
                    {dummyHrs.map((hr) => <option value={hr} key={hr}>{hr}</option>)}
                </select>
                <select name="breakEndMin" defaultValue={defaultBreakEndMin}>
                    {dummyMinutes.map((min) => <option value={min} key={min}>{min}</option>)}
                </select>
                <select name="breakEndMeridiem" defaultValue={defaultBreakEndMeridiem}>
                    {meridiem.map((mer) => <option value={mer} key={mer}>{mer}</option>)}
                </select>
            </div>

            <button type="submit">Create Template</button>
        </Form>
    </>);
}