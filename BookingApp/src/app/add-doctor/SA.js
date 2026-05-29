"use server";

import { db } from "../lib/turso";
import { nanoid } from "nanoid";
import { hash } from "../utils/bcrypt";
import { getUserPlus } from "../lib/getUser";
import { revalidatePath } from "next/cache";

export async function addDoctorServerAction(prevState, formData) {
    try {
        const currentUser = await getUserPlus();
        if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) {
            return { ok: false, message: "Unauthorized: Admin access required" };
        }

        const adminId = currentUser.admin_id;
        const name = formData.get("name")?.toString().trim() || "";
        const username = formData.get("username")?.toString().trim() || "";
        const password = formData.get("password")?.toString() || "";
        const department = formData.get("department")?.toString().trim() || "";
        const treatmentPubId = formData.get("treatmentPubId")?.toString() || "";
        const rawQuals = formData.get("qualification")?.toString() || "";

        if (name.length < 3 || name.length > 20) return { ok: false, message: "Name must be between 3 and 20 characters" };
        if (username.length < 3 || username.length > 20) return { ok: false, message: "Username must be between 3 and 20 characters" };
        if (password.length < 8 || password.length > 64) return { ok: false, message: "Password must be between 8 and 64 characters" };
        if (!department) return { ok: false, message: "Department is required" };
        if (!treatmentPubId) return { ok: false, message: "Please select a treatment" };

        const qualification = rawQuals
            .split(/[ ,]+/)
            .filter(Boolean)
            .map(q => q.trim().toLowerCase());

        if (qualification.length === 0) return { ok: false, message: "At least one qualification is required" };

        const [fetchTreatment, fetchUsername] = await Promise.all([
            db.execute("SELECT id FROM treatments WHERE admin_id = ? AND public_id = ?", [adminId, treatmentPubId]),
            db.execute("SELECT id FROM users WHERE username = ?", [username])
        ]);

        if (fetchTreatment.rows.length === 0) return { ok: false, message: "Invalid treatment selected" };
        if (fetchUsername.rows.length > 0) return { ok: false, message: "Username is already taken" };

        const passwordHash = await hash(password);
        const doctorPubId = nanoid(12);

        const result = await db.execute(
            `INSERT INTO doctors (admin_id, name, username, password, department, public_id, qualifications) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
            [adminId, name.toLowerCase().replace(/\s/g, "-"), username, passwordHash, department.toLowerCase().replace(/\s/g, "-"), doctorPubId, JSON.stringify(qualification)]
        );

        const doctorId = result.rows[0]?.id;

        await db.batch([
            {
                sql: `INSERT INTO doctor_treatments (public_id, admin_id, doctor_id, treatment_id) VALUES (?, ?, ?, ?)`,
                args: [nanoid(12), adminId, doctorId, fetchTreatment.rows[0].id]
            },
            {
                sql: `INSERT INTO users (public_id, doctor_id, role, username, password, status) VALUES (?, ?, ?, ?, ?, ?)`,
                args: [nanoid(12), doctorId, "doctor", username, passwordHash, "verified"]
            }
        ], "write");

        revalidatePath("/add-doctor");
        return { ok: true, message: "Doctor successfully added" };
    } catch (error) {
        console.error(error);

        if (error.message?.includes("UNIQUE constraint failed") || error.code === "SQLITE_CONSTRAINT") {
            return {
                ok: false,
                message: "Username is already taken"
            };
        } else {
            return {
                ok: false,
                message: "Something went wrong, please try again"
            };
        }
    }
}