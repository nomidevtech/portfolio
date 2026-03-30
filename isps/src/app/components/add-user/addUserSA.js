"use server";

import { db } from "@/app/lib/turso";
import { updateRecords } from "@/app/lib/update-records";
import { initUsersTable } from "@/app/models/table-inits";
import { nanoid } from "nanoid";

export async function addUserServerAction(_, formData) {
    try {
        const username = formData.get("username")?.toString().trim();
        const planPublicId = formData.get("plan_public_id")?.toString().trim();
        const password = formData.get("password")?.toString().trim();
        const contactRaw = formData.get("contact")?.toString().trim();
        const contact = contactRaw ? parseInt(contactRaw) : null;

        if (!username || !planPublicId) {
            return { ok: false, message: "Username and plan are required" };
        }

        const adminId = 1;

        const fetchPlanDetails = await db.execute(`SELECT id FROM plans WHERE public_id = ?`, [planPublicId]);
        if (fetchPlanDetails.rows.length === 0) {
            return { ok: false, message: "Select a valid plan" };
        }

        const planId = fetchPlanDetails.rows[0].id;

        await updateRecords();

        const result = await db.execute(
            `INSERT INTO users (public_id, admin_id, username, password, contact) 
             VALUES (?, ?, ?, ?, ?) RETURNING id`,
            [nanoid(12), adminId, username, password, contact]
        );

        const userId = result.rows[0]?.id;

        if (!userId) {
            return { ok: false, message: "Error creating user profile" };
        }

        await db.execute(
            `INSERT INTO user_plans (user_id, plan_id) VALUES (?, ?)`,
            [userId, planId]
        );

        return { ok: true, message: "User added successfully" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error adding user" };
    }
}