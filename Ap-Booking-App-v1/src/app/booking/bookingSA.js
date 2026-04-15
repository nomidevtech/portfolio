"use server";

import { nanoid } from "nanoid";
import { db } from "../lib/turso";
import { initBookingsTable } from "../models/initiTables";
import { redirect } from "next/navigation";

export async function bookingServerAction(formData) {
    try {
        const name = formData.get("full_name");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const treatment = formData.get("treatment");
        const slot = JSON.parse(formData.get("slot"));

        const monthName = slot.baseSlot.monthName;
        const monthNumber = slot.baseSlot.month_number;
        const date = slot.baseSlot.date;
        const dayName = slot.baseSlot.day;
        const dayNumber = slot.baseSlot.day_number;

        const userSlot = slot.selectedSlot;

        const treatmentTime = 30; // hardcoded for now

        const fetchWeeklyTemplates = await db.execute(`SELECT * FROM weekly_template WHERE day = ? AND day_number = ?`, [dayName, dayNumber]);
        const weeklyTemplates = fetchWeeklyTemplates?.rows[0];

        const virtualSlotsBase = [];
        if (fetchWeeklyTemplates.rows.length > 0) {
            virtualSlotsBase.push({ start: weeklyTemplates.start_time, end: weeklyTemplates.break_start }, { start: weeklyTemplates.break_end, end: weeklyTemplates.end_time });
        }

        if (virtualSlotsBase.length === 0) return { ok: false, message: "Invalid booking slot" };

        // ✅ Validate that userSlot falls within one of the server-side base slots
        const slotIsInBase = virtualSlotsBase.some(
            base => userSlot.start >= base.start && userSlot.end <= base.end
        );

        if (!slotIsInBase) return { ok: false, message: "Slot out of base bounds" };

        await initBookingsTable();
        const fetchExistingBookings = await db.execute(`SELECT * FROM bookings WHERE date = ? AND day_name = ? AND day_number = ? AND month_name = ?`, [date, dayName, dayNumber, monthName]);

        const existingBookings = fetchExistingBookings.rows;
        const existingVirtualSlots = existingBookings?.map(fn => { return { start: fn.treatment_start, end: fn.treatment_end } });

        let overlap = false;
        let validTreatmentSlot = userSlot.end - userSlot.start === treatmentTime;

        const fetchBufferTime = fetchWeeklyTemplates.rows[0].buffer_minutes;

        if (existingVirtualSlots.length > 0) {
            for (const segment of existingVirtualSlots) {
                if (userSlot.start < segment.end + fetchBufferTime && userSlot.end > segment.start - fetchBufferTime) {
                    overlap = true;
                    break;
                }
            }
        }

        if (overlap) return { ok: false, message: "Slot already taken" };
        if (!validTreatmentSlot) return { ok: false, message: "Invalid treatment time" };

        await db.execute(` INSERT INTO bookings (public_id, patient_name, patient_email, patient_phone, treatment_type, treatment_start, treatment_end, date, month_name, month_number, day_name, day_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) `, [nanoid(), name, email, phone, treatment, userSlot.start, userSlot.end, date, monthName, monthNumber, dayName, dayNumber]);

    } catch (error) {
        console.error(error);
        throw error;
    }

    redirect("/booking");
}