"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { nanoid } from "nanoid";
import { hash } from "../utils/bcrypt";
import { getUserPlus } from "../lib/getUser";

export async function addDoctorServerAction(formData) {
    let success = false;

    try {
        const currentUser = await getUserPlus();
        if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) redirect("/login");
        const adminId = currentUser.admin_id;

        const name = formData.get("name")?.toString().replace(/\s/g, "-").toLowerCase() || "";
        const username = formData.get("username")?.toString() || "";
        const password = formData.get("password")?.toString() || "";
        const department = formData.get("department")?.toString().replace(/\s/g, "-").toLowerCase() || "";
        const treatmentPubId = formData.get("treatmentPubId")?.toString() || "";



        const qualification = formData.get("qualification")
            ?.toString()
            .split(/[ ,]+/)
            .filter(Boolean)
            .map(q => q.trim().toLowerCase());

        const fetchTreatment = await db.execute(
            "SELECT id FROM treatments WHERE admin_id = ? AND public_id = ?",
            [adminId, treatmentPubId]
        );

        if (fetchTreatment.rows.length === 0) return null;

        const passwordHash = await hash(password);

        const result = await db.execute(
            `INSERT INTO doctors (admin_id, name, username, password, department, public_id, qualifications) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            [adminId, name.toLowerCase(), username, passwordHash, department.toLowerCase(), nanoid(12), JSON.stringify(qualification)]
        );

        const doctorId = result.rows[0]?.id;
        if (!doctorId) return null;

        await db.execute(
            `INSERT INTO doctor_treatments (public_id, admin_id, doctor_id, treatment_id) VALUES (?, ?, ?, ?)`,
            [nanoid(12), adminId, doctorId, fetchTreatment.rows[0].id]
        );

        await db.execute(
            `INSERT INTO users (public_id, doctor_id, role, username, password) VALUES (?, ?, ?, ?, ?)`, [
            nanoid(12),
            doctorId,
            "doctor",
            username,
            passwordHash
        ]);

        success = true;
    } catch (error) {
        console.error(error);
        return null;
    }

    if (success) {
        redirect("/add-doctor");
    }
}