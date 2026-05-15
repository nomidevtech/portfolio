// src/app/lib/deleteWeeklyTemplate.js
"use server";

import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import { getUserPlus } from "@/app/lib/getUser";
import { sendCancelationEmails } from "@/app/lib/sendCancelationEmail";
import { rollingWindow } from "@/app/lib/rollingWindow";


// ─── Original simple delete (kept as-is for backward compatibility) ───────────
export async function deleteWeeklyTemplateServerAction(formData) {

    const currentUser = await getUserPlus();
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) redirect("/login");

    const adminId = currentUser.admin_id;
    const docPubId = formData.get("docPubId");
    const templatePubId = formData.get("templatePubId");

    const fetchDocId = await db.execute(`SELECT id FROM doctors WHERE public_id = ? AND admin_id = ?`, [docPubId, adminId]);
    if (fetchDocId?.rows.length === 0) return redirect("/edit-template");

    if (!docPubId || !templatePubId) return;

    let success = false;

    try {
        const result = await db.execute(
            `DELETE FROM weekly_templates 
             WHERE public_id = ? AND admin_id = ? AND doctor_id = ?`,
            [templatePubId, adminId, fetchDocId.rows[0].id]
        );
        if (result.rowsAffected > 0) success = true;

    } catch (error) {
        console.error(error);
    }

    if (success) return redirect(`/edit-template/${docPubId}`);
}



export async function deleteWeeklyTemplateWithCleanupSA(formData) {

    const currentUser = await getUserPlus();
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) redirect("/login");

    const adminId = currentUser.admin_id;
    const docPubId = formData.get("docPubId");
    const templatePubId = formData.get("templatePubId");

    if (!docPubId || !templatePubId) redirect("/edit-template");


    const fetchDoctor = await db.execute(
        `SELECT id FROM doctors WHERE public_id = ? AND admin_id = ?`,
        [docPubId, adminId]
    );
    if (fetchDoctor.rows.length === 0) redirect("/edit-template");
    const doctorId = fetchDoctor.rows[0].id;

    const fetchTemplate = await db.execute(
        `SELECT id, day_number FROM weekly_templates WHERE public_id = ? AND admin_id = ? AND doctor_id = ?`,
        [templatePubId, adminId, doctorId]
    );
    if (fetchTemplate.rows.length === 0) redirect(`/edit-template/${docPubId}`);

    const { id: templateId, day_number } = fetchTemplate.rows[0];

    try {
        const revokedResult = await db.execute(
            `UPDATE bookings
             SET status = 'revoked'
             WHERE admin_id = ?
               AND doctor_id = ?
               AND status NOT IN ('revoked', 'cancelled')
               AND booking_date_iso IN (
                   SELECT full_date_at_period
                   FROM slots
                   WHERE admin_id = ?
                     AND doctor_id = ?
                     AND day_number = ?
                     AND full_date_at_period >= DATE('now')
               )
             RETURNING patient_email, patient_name, doctor_name`,
            [adminId, doctorId, adminId, doctorId, day_number]
        );

        if (revokedResult.rows.length > 0) {
            try {
                const emailableRows = revokedResult.rows.filter(r => r.patient_email);
                if (emailableRows.length > 0) await sendCancelationEmails(emailableRows, 100);
            } catch (emailErr) {
                console.error("Template deleted but patient emails failed to send:", emailErr);
            }
        }
        await db.execute(
            `DELETE FROM slots
             WHERE admin_id = ?
               AND doctor_id = ?
               AND day_number = ?
               AND full_date_at_period >= DATE('now')`,
            [adminId, doctorId, day_number]
        );


        await db.execute(
            `DELETE FROM weekly_templates WHERE id = ? AND admin_id = ?`,
            [templateId, adminId]
        );

        await rollingWindow(adminId);

    } catch (error) {
        console.error("deleteWeeklyTemplateWithCleanupSA failed:", error);
    }

    redirect(`/edit-template/${docPubId}`);
}