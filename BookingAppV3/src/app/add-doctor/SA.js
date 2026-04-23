"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { nanoid } from "nanoid";

export async function addDoctorServerAction(formData) {
    try {
        const adminId = 1; // hardcoded for now
        const name = formData.get("name");
        const department = formData.get("department");

        await db.execute(`INSERT INTO doctors (admin_id, name, department, public_id) VALUES (?, ?, ?, ?)`, [adminId, name, department, nanoid(12)]);

    } catch (error) {
        console.error(error);
        throw error;
    }
    redirect("/add-doctor");
}