"use server";

import { nanoid } from "nanoid";
import { initDoctorsTable, initWeeklyTemplateTable } from "../../../models/initiTables";
import { redirect } from "next/navigation";
import { db } from "../../../lib/turso";


function getMinutes(hr, min, meridiem) {
    let h = Number(hr);
    const m = Number(min);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return (h * 60) + m;
}

export async function dayServerAction(formData) {

    const daysCode = [
        { day: "Sunday", code: 0 },
        { day: "Monday", code: 1 },
        { day: "Tuesday", code: 2 },
        { day: "Wednesday", code: 3 },
        { day: "Thursday", code: 4 },
        { day: "Friday", code: 5 },
        { day: "Saturday", code: 6 }
    ];

    const monthCode = [
        { month: "January", code: 0 },
        { month: "February", code: 1 },
        { month: "March", code: 2 },
        { month: "April", code: 3 },
        { month: "May", code: 4 },
        { month: "June", code: 5 },
        { month: "July", code: 6 },
        { month: "August", code: 7 },
        { month: "September", code: 8 },
        { month: "October", code: 9 },
        { month: "November", code: 10 },
        { month: "December", code: 11 }
    ]

    const d = new Date();
    const currentMonthNumber = d.getMonth();
    const currentMonthName = monthCode.find((mn) => mn.code === currentMonthNumber).month?.toLowerCase();
    const date = d.getDate();
    const nextMonthNumber = currentMonthNumber + 1;
    const currentYear = d.getFullYear();
    const currentMonthNumberOfDays = new Date(currentYear, nextMonthNumber, 0).getDate();



    const docPubId = formData.get("doctorPublicId");
    const dayFromUser = formData.get("day")?.toLowerCase();
    const dayNumber = daysCode.find((fn) => fn.day.toLowerCase() === dayFromUser).code;
    const buffer = Number(formData.get("buffer"));
    const startInMinutes =
        getMinutes(formData.get("startHr"), formData.get("startMin"), formData.get("startMeridiem"));
    const endInMinutes =
        getMinutes(formData.get("endHr"), formData.get("endMin"), formData.get("endMeridiem"));
    const breakStartInMinutes =
        getMinutes(formData.get("breakStartHr"), formData.get("breakStartMin"), formData.get("breakStartMeridiem"));
    const breakEndInMinutes =
        getMinutes(formData.get("breakEndHr"), formData.get("breakEndMin"), formData.get("breakEndMeridiem"));

    const fetchDoctorId = await db.execute("SELECT id, department FROM doctors WHERE public_id = ?", [docPubId]);
    if (fetchDoctorId.rows.length === 0) return { ok: false, message: "Doctor not found" };
    const doctorId = fetchDoctorId.rows[0].id;


    const templatesArr = [];

    for (let i = date; i <= currentMonthNumberOfDays; i++) {
        const publicIdAtPeriod = nanoid(12);
        const dayNumberAtPeriod = new Date(currentYear, currentMonthNumber, i).getDay();
        const dayNameAtPeriod = daysCode.find(fn => fn.code === dayNumberAtPeriod).day?.toLowerCase();
        if (dayNameAtPeriod === dayFromUser && dayNumberAtPeriod === dayNumber) templatesArr.push(
            {
                publicIdAtPeriod,
                status: 1,
                dateAtPeriod: i,
                currentMonthNumber,
                currentMonthName,
                currentYear,
                dayNumberAtPeriod,
                dayNameAtPeriod,
                doctorId,
                buffer,
                startInMinutes,
                endInMinutes,
                breakStartInMinutes,
                breakEndInMinutes
            });
    };

    const columns = `public_id, status, doctor_id, day, day_number, month_name, month_number, year, date, start_time, end_time, break_start, break_end, buffer_minutes`;

    const placeHolder = templatesArr.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`).join(", ");
    const values = templatesArr.flatMap(template => [
        template.publicIdAtPeriod,
        template.status,
        template.doctorId,
        template.dayNameAtPeriod,
        template.dayNumberAtPeriod,
        template.currentMonthName,
        template.currentMonthNumber,
        template.currentYear,
        template.dateAtPeriod,
        template.startInMinutes,
        template.endInMinutes,
        template.breakStartInMinutes,
        template.breakEndInMinutes,
        template.buffer,
    ]);

    const insertQuery = `INSERT INTO weekly_template (${columns}) VALUES ${placeHolder};`;

    try {
        await db.execute(insertQuery, values);
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Database operation failed" };
    }

    redirect(`/manage-weekly-template/${docPubId}`);
}






export async function createWeeklyTemplateServerAction(_, formData) {
    try {
        await initDoctorsTable();
        await initWeeklyTemplateTable();

        const drPublicId = formData.get("doctorPublicId");
        const d = new Date();
        const currentMonthNumber = d.getMonth();

        const fetchDr = await db.execute("SELECT * FROM doctors WHERE public_id = ?", [drPublicId]);
        if (fetchDr.rows.length === 0) return { ok: false, searchComplete: true, message: "Doctor not found" };

        const doctorId = fetchDr.rows[0].id;
        const doctorName = fetchDr.rows[0].name;

        const fetchSlots = await db.execute("SELECT * FROM weekly_template WHERE doctor_id = ? AND month_number = ?", [doctorId, currentMonthNumber]);

        const data = [];

        if (fetchSlots.rows.length > 0) {
            for (let i = 0; i < fetchSlots.rows.length; i++) {
                const slot = fetchSlots.rows[i];
                data.push({
                    public_id: slot.public_id,
                    status: slot.status,
                    doctorName,
                    day: slot.day,
                    day_number: slot.day_number,
                    monthName: slot.month_name,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    break_start: slot.break_start,
                    break_end: slot.break_end,
                    buffer_minutes: slot.buffer_minutes,
                    date: slot.date,
                });
            }
        }

        console.log("i reached here------------------------------>", data);

        return { ok: true, searchComplete: true, data, message: "Weekly templates found" };
    } catch (error) {
        console.error(error);
        return { ok: false, searchComplete: true, message: "Database operation failed" };
    }
}