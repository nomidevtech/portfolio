"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { nanoid } from "nanoid";
import { getUserPlus } from "../lib/getUser";

export async function addTreatmentServerAction(formData) {
    try {
        const currentUser = await getUserPlus();
        if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) redirect("/login");
        const adminId = currentUser.admin_id;

        const name = formData.get("name")?.trim().toLowerCase().replace(/\s+/g, "_");
        const duration = Number(formData.get("duration")) || 0;

        if (!name || duration <= 0) return null; 


        await db.execute(`INSERT INTO treatments (admin_id, name, duration, public_id) VALUES (?, ?, ?, ?)`, [adminId, name.toLowerCase(), duration, nanoid(12)]);

    } catch (error) {
        console.error(error);
        return null;
    }
    redirect("/add-treatment");
}