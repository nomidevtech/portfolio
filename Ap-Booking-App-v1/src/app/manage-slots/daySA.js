"use server";

import { nanoid } from "nanoid";
import { initSlotPerDayTalbe } from "../models/initiTables";
import { redirect } from "next/navigation";
import { db } from "../lib/turso";

function getMinutes(hr, min, meridiem) {
    let h = Number(hr); // exptected format: "01"
    const m = Number(min); // exptected format: "01"
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return (h * 60) + m;
}

export async function dayServerAction(formData) {
    await initSlotPerDayTalbe();

    const day = formData.get("day");
    const buffer = Number(formData.get("buffer"));

    const startInMinutes = getMinutes(formData.get("startHr"), formData.get("startMin"), formData.get("startMeridiem"));
    const endInMinutes = getMinutes(formData.get("endHr"), formData.get("endMin"), formData.get("endMeridiem"));
    const breakStartInMinutes = getMinutes(formData.get("breakStartHr"), formData.get("breakStartMin"), formData.get("breakStartMeridiem"));
    const breakEndInMinutes = getMinutes(formData.get("breakEndHr"), formData.get("breakEndMin"), formData.get("breakEndMeridiem"));


    try {
        const fetchRecord = await db.execute("SELECT * FROM slotPerDay WHERE day = ?", [day]);

        if (fetchRecord.rows.length > 0) {
            await db.execute(
                "UPDATE slotPerDay SET start_time = ?, end_time = ?, break_start = ?, break_end = ?, buffer_minutes = ? WHERE day = ?",
                [startInMinutes, endInMinutes, breakStartInMinutes, breakEndInMinutes, buffer, day]
            );
        } else {
            const publicId = nanoid(12);
            await db.execute(
                "INSERT INTO slotPerDay (public_id, day, start_time, end_time, break_start, break_end, buffer_minutes) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [publicId, day, startInMinutes, endInMinutes, breakStartInMinutes, breakEndInMinutes, buffer]
            );
        }
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Database operation failed" };
    }

    redirect("/manage-slots");
}