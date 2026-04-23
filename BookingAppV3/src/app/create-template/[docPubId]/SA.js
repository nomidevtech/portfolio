"use server";

import { db } from "@/app/lib/turso";
import { initAdminTable, initDoctorTable, initWeeklyTemplatesTable } from "@/app/Models/initTables";
import { getDayNumber } from "@/app/utils/getDateData";
import getMinutes from "@/app/utils/getMinutes";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";



export async function createTemplateServerAction(formData) {

    const docPubId = formData.get("doctorPublicId");

    try {
        const adminId = 1; // harcoded for now

        const fetchDoctor = await db.execute(`SELECT * FROM doctors WHERE public_id = ?`, [docPubId]);
        // if (fetchDoctor.rows === 0) throw new Error("doctor not found");

        const doctor = fetchDoctor.rows[0];

        const dayFromUser = formData.get("day")?.toLowerCase();
        const dayNumber = getDayNumber(dayFromUser);
        const buffer = Number(formData.get("buffer"));

        // We are getting values and passing them as arguments in single line.
        const startInMinutes =
            getMinutes(formData.get("startHr"), formData.get("startMin"), formData.get("startMeridiem"));
        const endInMinutes =
            getMinutes(formData.get("endHr"), formData.get("endMin"), formData.get("endMeridiem"));
        const breakStartInMinutes =
            getMinutes(formData.get("breakStartHr"), formData.get("breakStartMin"), formData.get("breakStartMeridiem"));
        const breakEndInMinutes =
            getMinutes(formData.get("breakEndHr"), formData.get("breakEndMin"), formData.get("breakEndMeridiem"));





        await db.execute(`INSERT INTO weekly_templates (public_id, admin_id, doctor_id, day_number, start_time, end_time, break_start, break_end, buffer_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            nanoid(12),
            adminId,
            doctor.id,
            dayNumber,
            startInMinutes,
            endInMinutes,
            breakStartInMinutes,
            breakEndInMinutes,
            buffer
        ]);




        console.log("docPubId", docPubId);
        console.log("dayNumber", dayNumber);
        console.log("buffer", buffer);
        console.log("startInMinutes", startInMinutes);
        console.log("endInMinutes", endInMinutes);
        console.log("breakStartInMinutes", breakStartInMinutes);
        console.log("breakEndInMinutes", breakEndInMinutes);




    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message }
    }
    redirect(`/create-template/${docPubId}`)
}

