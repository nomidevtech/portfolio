"use server";

import { db } from "@/app/lib/turso";
import { updateRecords } from "@/app/lib/update-records";
import { initUsersTable } from "@/app/models/table-inits";
import { nanoid } from "nanoid";
import { getUser } from "../lib/getUser";

export async function addUserServerAction(_, formData) {

    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, message: "You must be logged in" };

    await initUsersTable();
    //await updateRecords();

    try {
        const username = formData.get("username")?.toString().trim();
        const planPublicId = formData.get("plan_public_id")?.toString().trim();
        const password = formData.get("password")?.toString().trim() || null;
        const contactRaw = formData.get("contact")?.toString().trim();
        const contact = contactRaw ? Number(contactRaw) : 0;

        if (!username || !planPublicId) {
            return { ok: false, message: "Username and plan are required" };
        }

        const adminId = currentUser.id;

        const fetchPlanDetails = await db.execute(`SELECT id FROM plans WHERE public_id = ?`, [planPublicId]);
        if (fetchPlanDetails.rows.length === 0) {
            return { ok: false, message: "Select a valid plan" };
        }

        const planId = fetchPlanDetails.rows[0].id;



        const result = await db.execute(
            `INSERT INTO users (public_id, admin_id, username, password, contact, plan_id) 
                VALUES (?, ?, ?, ?, ?, ?)`,
            [nanoid(12), adminId, username, password, contact, planId]
        );

        if (result.rowsAffected === 0) return { ok: false, message: "Error adding user" };

        return { ok: true, message: "User added successfully" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error adding user" };
    }
}