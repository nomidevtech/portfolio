import Form from "next/form";
import { dayServerAction } from "../daySA";
import { db } from "../../lib/turso";
import { minutesToMeridiem } from "../../utils/minutes-to-meridiem";

export default async function EditDaySlots({ searchParams }) {
    const { d: day, edit = "false" } = await searchParams;

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

    const fetchRecord = await db.execute(`SELECT * FROM weekly_template WHERE day = ?`, [day]);
    if (fetchRecord.rows.length > 0) {

        const record = fetchRecord.rows[0];

        defaultStartHr = minutesToMeridiem(record.start_time, false).hrs;
        defaultStartMin = minutesToMeridiem(record.start_time, false).mins;
        defaultStartMeridiem = minutesToMeridiem(record.start_time, false).meridiem;

        defaultEndHr = minutesToMeridiem(record.end_time, false).hrs;
        defaultEndMin = minutesToMeridiem(record.end_time, false).mins;
        defaultEndMeridiem = minutesToMeridiem(record.end_time, false).meridiem;

        defaultBreakStartHr = minutesToMeridiem(record.break_start, false).hrs;
        defaultBreakStartMin = minutesToMeridiem(record.break_start, false).mins;
        defaultBreakStartMeridiem = minutesToMeridiem(record.break_start, false).meridiem;

        defaultBreakEndHr = minutesToMeridiem(record.break_end, false).hrs;
        defaultBreakEndMin = minutesToMeridiem(record.break_end, false).mins;
        defaultBreakEndMeridiem = minutesToMeridiem(record.break_end, false).meridiem;

        defaultBuffer = record.buffer_minutes;
    };



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
        {edit === "false" && day && <>Configure: {day}</>}
        {edit === "true" && day && <>Edit: {day}</>}
        <Form action={dayServerAction} className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-md">
            <input type="hidden" name="day" value={day} />
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