'use client';

import Form from "next/form";
import { minutesToMeridiem } from "../../utils/minutes-to-meridiem";
import { editWeeklyTemplateServerAction } from "./editTemplateSA";
import { useState } from "react";

export default function Client({ template, bookings, doctorName }) {

    const [showBookings, setShowBookings] = useState(false);
    const [update, setUpdate] = useState(false);

    const defaultBuffer = template.buffer_minutes;

    const defaultStartHr = minutesToMeridiem(template.start_time, false).hrs;
    const defaultStartMin = minutesToMeridiem(template.start_time, false).mins;
    const defaultStartMeridiem = minutesToMeridiem(template.start_time, false).meridiem;

    const defaultEndHr = minutesToMeridiem(template.end_time, false).hrs;
    const defaultEndMin = minutesToMeridiem(template.end_time, false).mins;
    const defaultEndMeridiem = minutesToMeridiem(template.end_time, false).meridiem;

    const defaultBreakStartHr = minutesToMeridiem(template.break_start, false).hrs;
    const defaultBreakStartMin = minutesToMeridiem(template.break_start, false).mins;
    const defaultBreakStartMeridiem = minutesToMeridiem(template.break_start, false).meridiem;

    const defaultBreakEndHr = minutesToMeridiem(template.break_end, false).hrs;
    const defaultBreakEndMin = minutesToMeridiem(template.break_end, false).mins;
    const defaultBreakEndMeridiem = minutesToMeridiem(template.break_end, false).meridiem;



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
        <h2>Doctor Name: {doctorName}</h2>
        <h2>{template.month_name[0].toUpperCase() + template.month_name.slice(1)} {template.date > 9 ? template.date : "0" + template.date} {template.day[0].toUpperCase() + template.day.slice(1)}</h2>
        <Form action={editWeeklyTemplateServerAction} className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-md">
            <input type="hidden" name="publicId" value={template?.public_id} />
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
                {!update && <button onClick={() => setUpdate(true)} >Update</button>}
                {update && <>
                    {bookings.length > 0 ? <h2>Warning, There are {bookings.length} bookings associated with this template. If you proceed with this action: even without new changes the associated bookings will be cancelled and patients will be notified to reschedule. </h2> : <h2>Are you sure you want to update this template</h2>}
                    <button
                        type="submit"
                        className="mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        Proceed
                    </button>
                </>}
                {update && <button onClick={() => setUpdate(false)}>Cancel</button>}

            </div>
        </Form>
        {bookings.length > 0 && <>
            <h2>Bookings Found : {bookings.length}</h2>
            <button onClick={() => setShowBookings(!showBookings)}>{showBookings ? "Hide Bookings" : "Show Bookings"}</button>
        </>}
        {showBookings && <>
            {bookings.map((booking) => (
                <div key={booking.bookingPublicId} className="border-2">
                    <p>Patient Name: {booking.patientName}</p>
                    <p>Appointment: {minutesToMeridiem(booking.start_time, true)}- {minutesToMeridiem(booking.end_time, true)}</p>
                    <p>Treatment Type: {booking.treatment}</p>

                </div>
            ))}
        </>}
    </>);
}