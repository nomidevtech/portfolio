"use server";

import { nanoid } from "nanoid";
import { db } from "../lib/turso";
import { initBookingsTalbe } from "../models/initiTables";
import { redirect } from "next/navigation";


export async function bookingServerAction(formData) {
    try {
        const name = formData.get("full_name");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const treatment = formData.get("treatment");
        const slot = JSON.parse(formData.get("slot"));

        const monthName = slot.baseSlot.monthName;
        const date = slot.baseSlot.date;
        const dayName = slot.baseSlot.day;
        const dayNumber = slot.baseSlot.day_number;

        const userSlot = slot.selectedSlot;

        const fetchTreaments = null;
        const treament_time = 30; // hardcoded for now


        const fetchWeeklyTemplates = await db.execute(`SELECT * FROM weekly_template WHERE day = ? AND day_number = ?`, [dayName, dayNumber]);
        const weeklyTemplates = fetchWeeklyTemplates?.rows[0];

        const virtualSlotsBase = [];
        if (weeklyTemplates.length > 0) {
            virtualSlotsBase.push({ start: weeklyTemplates.start_time, end: weeklyTemplates.break_start }, { start: weeklyTemplates.break_end, end: weeklyTemplates.end_time });
        };

        if (slot.baseSlot.virtualSlotsBase.length === 0) return { ok: false, message: "Invalid booking slot" };

        await initBookingsTalbe();
        const fetchExistingBookings = await db.execute(`SELECT * FROM bookings WHERE date = ? AND day_name = ? AND day_number = ? AND month_name = ?`, [date, dayName, dayNumber, monthName]);

        const existingBookings = fetchExistingBookings.rows;

        const existingVirtualSLots = existingBookings?.map(fn => { return { start: fn.treatment_start, end: fn.treatment_end } });

        let overlap = false // hardcoded for now
        let validTreamentSlot = userSlot.end - userSlot.start === treament_time;

        const fetchBufferTime = fetchWeeklyTemplates.rows[0].buffer_minutes

        console.log("1------------------>", fetchBufferTime);

        if (existingVirtualSLots.length > 0) {
            for (const segment of existingVirtualSLots) {
                if (userSlot.start < segment.end + fetchBufferTime && userSlot.end > segment.start - fetchBufferTime) {
                    overlap = true;
                    break;
                }
            }
        }

        console.log("2------------------>");

        if (overlap) return { ok: false, message: "Slot already taken" };
        if (!validTreamentSlot) return { ok: false, message: "Invalid treatment time" };

        await db.execute(` INSERT INTO bookings (public_id, patient_name, patient_email, patient_phone, treatment_type, treatment_start, treatment_end, date, month_name, day_name, day_number) VALUES (?,?,?,?,?,?,?,?,?,?,?) `, [nanoid(), name, email, phone, treatment, userSlot.start, userSlot.end, date, monthName, dayName, dayNumber]);









        console.log("i reached here --------------------->")









        console.log("VIRTUAL SLOTS BASE:---------------------->", virtualSlotsBase);




        console.log("NAME:", name);
        console.log("EMAIL:", email);
        console.log("PHONE:", phone);
        console.log("TREATMENT:", treatment);
        console.log("User Slot:", userSlot);
        console.log("Month Name:", monthName);
        console.log("Date:", date);
        console.log("Day Name:", dayName);
        console.log("Day Number:", dayNumber);

        console.dir(slot, { depth: null });


    } catch (error) {
        console.error(error);
        throw error;
    }

    redirect("/booking");
}