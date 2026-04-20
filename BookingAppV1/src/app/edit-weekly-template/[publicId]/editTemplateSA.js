"use server";

import { redirect } from "next/navigation";
import { db } from "../../lib/turso";

export async function editWeeklyTemplateServerAction(formData) {

    const templatePublicId = formData.get("publicId");

    const fetchTemplate = await db.execute("SELECT * FROM weekly_template WHERE public_id = ?", [templatePublicId]);
    if (fetchTemplate.rows.length === 0) return null;

    const templateId = fetchTemplate.rows[0].id;


    const buffer = Number(formData.get("buffer"));

    const startHr = formData.get("startHr");
    const startMin = formData.get("startMin");
    const startMeridiem = formData.get("startMeridiem");

    const endHr = formData.get("endHr");
    const endMin = formData.get("endMin");
    const endMeridiem = formData.get("endMeridiem");

    const breakStartHr = formData.get("breakStartHr");
    const breakStartMin = formData.get("breakStartMin");
    const breakStartMeridiem = formData.get("breakStartMeridiem");

    const breakEndHr = formData.get("breakEndHr");
    const breakEndMin = formData.get("breakEndMin");
    const breakEndMeridiem = formData.get("breakEndMeridiem");


    const startInMinutes = getMinutes(startHr, startMin, startMeridiem);
    const endInMinutes = getMinutes(endHr, endMin, endMeridiem);
    const breakStartInMinutes = getMinutes(breakStartHr, breakStartMin, breakStartMeridiem);
    const breakEndInMinutes = getMinutes(breakEndHr, breakEndMin, breakEndMeridiem);



    try {
        await db.execute(`
        UPDATE weekly_template SET
        start_time = ?, end_time = ?, break_start = ?, break_end = ?, buffer_minutes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`, [startInMinutes, endInMinutes, breakStartInMinutes, breakEndInMinutes, buffer, templateId]
        );


    } catch (error) {
        console.error(error);
        return null;
    }
    redirect(`/edit-weekly-template/${templatePublicId}`);
}



function getMinutes(hr, min, meridiem) {
    let h = Number(hr);
    const m = Number(min);
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return (h * 60) + m;
};