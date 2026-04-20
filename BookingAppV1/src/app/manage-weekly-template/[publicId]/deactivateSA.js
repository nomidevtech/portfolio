"use server";

import { db } from "../../lib/turso";

export async function toggleTemplateStatusServerAction(_, formData) {
    try {
        const templatePubId = formData.get("public_id");

        const fetchTemplate = await db.execute("SELECT * FROM weekly_template WHERE public_id = ?", [templatePubId]);
        if (fetchTemplate.rows.length === 0) return { ok: false, message: "Template not found" };

        const templateId = fetchTemplate.rows[0].id;
        const currentStatus = fetchTemplate.rows[0].status;
        const newStatus = currentStatus === 1 ? 0 : 1;
        await db.execute("UPDATE weekly_template SET status = ? WHERE id = ?", [newStatus, templateId]);





        return { ok: true, message: `Slot ${newStatus === 1 ? "activated" : "deactivated"}` }
    } catch (error) {
        console.error(error);
        return { ok: false, message: `Something went wrong while ${newStatus === 1 ? "activating" : "deactivating"}` }
    }
}