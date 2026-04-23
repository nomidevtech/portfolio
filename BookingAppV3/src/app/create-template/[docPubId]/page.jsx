import Form from "next/form";
import { db } from "@/app/lib/turso";
import { createTemplateServerAction } from "./SA";
import { getDayName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import Link from "next/link";


export default async function DoctorCreateTemplate({ params }) {
    const { docPubId } = await params;

    const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE public_id = ?`, [docPubId]);
    if (fetchDoctor.rows.length === 0) return <p>Broken link. Doctor not found.</p>

    const { name, id } = fetchDoctor.rows[0];

    const fetchExisTemplates = await db.execute(`SELECT * FROM weekly_templates WHERE doctor_id = ?`, [id]);

    let currentTemplates = fetchExisTemplates.rows.length > 0 ? fetchExisTemplates.rows : [];

    console.log(currentTemplates)

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
            <h2>{`Dr. ${name[0].toUpperCase() + name.slice(1)}'s Current Templates`}</h2>
            <h2> Department: {fetchDoctor.rows[0].department}</h2>
            {currentTemplates.length > 0 && <>
                {currentTemplates.map(temp => (
                    <div key={temp.public_id} className="border-2 border-amber-50" >
                        <p>Template Day: {getDayName(temp.day_number)}</p>
                        <p>Clinic Time: {minutesToMeridiem(temp.start_time, true)} - {minutesToMeridiem(temp.end_time, true)}</p>
                        <p>Break Duration: {minutesToMeridiem(temp.break_start, true)} - {minutesToMeridiem(temp.break_end, true)}</p>
                        <p>Buffer: {temp.buffer_minutes} minutes</p>
                        <Link href={`/edit-template/${docPubId}/${temp.public_id}`}>Edit⬅</Link>
                    </div>
                ))}
            </>}
        </div>


        <h1>Create New Template for Dr. {name[0].toUpperCase() + name.slice(1)}</h1>
        <Form action={createTemplateServerAction} className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-md">
            <input type="hidden" name="doctorPublicId" value={docPubId} />
            <select type="hidden" name="day" >
                {days.map((day) => (
                    <option value={day} key={day}>
                        {day}
                    </option>
                ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Buffer in minutes
            </label>
            <input defaultValue={defaultBuffer} type="number" name="buffer" placeholder="Buffer in minutes" className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select Clinic Start time
                </label>
                <div className="flex gap-2 items-center">
                    <select
                        name="startHr"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        defaultValue={defaultStartHr}
                    >
                        {dummyHrs.map((hr) => (
                            <option value={hr} key={hr}>
                                {hr}
                            </option>
                        ))}
                    </select>
                    <select
                        name="startMin"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        defaultValue={defaultStartMin}
                    >
                        {dummyMinutes.map((min) => (
                            <option value={min} key={min}>
                                {min}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultStartMeridiem}
                        name="startMeridiem"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {meridiem.map((mer) => (
                            <option value={mer} key={mer}>
                                {mer}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select Clinic End time
                </label>
                <div className="flex gap-2 items-center">
                    <select
                        defaultValue={defaultEndHr}
                        name="endHr"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {dummyHrs.map((hr) => (
                            <option value={hr} key={hr}>
                                {hr}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultEndMin}
                        name="endMin"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {dummyMinutes.map((min) => (
                            <option value={min} key={min}>
                                {min}
                            </option>
                        ))}
                    </select>
                    <select
                        defaultValue={defaultEndMeridiem}
                        name="endMeridiem"
                        className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                    >
                        {meridiem.map((mer) => (
                            <option value={mer} key={mer}>
                                {mer}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Break Start</label>
                    <div className="flex gap-2 items-center">
                        <select
                            defaultValue={defaultBreakStartHr}
                            name="breakStartHr"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyHrs.map((hr) => (
                                <option value={hr} key={hr}>
                                    {hr}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakStartMin}
                            name="breakStartMin"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyMinutes.map((min) => (
                                <option value={min} key={min}>
                                    {min}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakStartMeridiem}
                            name="breakStartMeridiem"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {meridiem.map((mer) => (
                                <option value={mer} key={mer}>
                                    {mer}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Break End</label>
                    <div className="flex gap-2 items-center">
                        <select
                            defaultValue={defaultBreakEndHr}
                            name="breakEndHr"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyHrs.map((hr) => (
                                <option value={hr} key={hr}>
                                    {hr}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakEndMin}
                            name="breakEndMin"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {dummyMinutes.map((min) => (
                                <option value={min} key={min}>
                                    {min}
                                </option>
                            ))}
                        </select>
                        <select
                            defaultValue={defaultBreakEndMeridiem}
                            name="breakEndMeridiem"
                            className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                        >
                            {meridiem.map((mer) => (
                                <option value={mer} key={mer}>
                                    {mer}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                    Submit
                </button>
            </div>
        </Form>
    </>);
}
