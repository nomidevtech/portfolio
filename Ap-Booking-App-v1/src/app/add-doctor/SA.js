"use server";

import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { db } from "../lib/turso";


export async function addDoctorServerAction(formData) {

    const name = formData.get("name");
    const department = formData.get("department");
    const title = formData.get("title");
    const publicId = nanoid(12);

    try {
        await db.execute(
            "INSERT INTO doctors (public_id, name, department, title) VALUES (?, ?, ?, ?)",
            [publicId, name, department, title]
        );
    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message }
    }
    redirect(`/create-weekly-template/${publicId}`);
}