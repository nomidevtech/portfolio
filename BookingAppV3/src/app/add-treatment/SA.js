"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { nanoid } from "nanoid";
import { initTreatmentTable } from "../Models/initTables";

export async function addTreatmentServerAction(formData) {
    try {
        const adminId = 1; // hardcoded for now
        const name = formData.get("name");
        const duration = Number(formData.get("duration")) || 0;

        await initTreatmentTable();

        await db.execute(`INSERT INTO treatments (admin_id, name, duration, public_id) VALUES (?, ?, ?, ?)`, [adminId, name, duration, nanoid(12)]);

    } catch (error) {
        console.error(error);
        throw error;
    }
    redirect("/add-treatment");
}