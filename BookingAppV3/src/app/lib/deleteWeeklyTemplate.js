"use server";

import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import { getUserPlus } from "@/app/lib/getUser";


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
