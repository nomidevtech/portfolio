"use server";

import { getUserPlus } from "@/app/lib/getUser";
import { db } from "@/app/lib/turso";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { hash } from "@/app/utils/bcrypt";

async function verify() {
    const currentUser = await getUserPlus();
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) redirect("/login");
    return currentUser.admin_id;
}

async function getDoctorId(doctorPubId, adminId) {
    if (!doctorPubId) return null;
    const result = await db.execute(
        `SELECT id FROM doctors WHERE public_id = ? AND admin_id = ?`,
        [doctorPubId, adminId]
    );
    return result.rows.length === 0 ? null : result.rows[0].id;
}

async function getTreatmentId(treatmentPubId, adminId) {
    if (!treatmentPubId) return null;
    const result = await db.execute(
        `SELECT id FROM treatments WHERE public_id = ? AND admin_id = ?`,
        [treatmentPubId, adminId]
    );
    return result.rows.length === 0 ? null : result.rows[0].id;
}

export async function editDoctorServerAction(prevState, formData) {
    const adminId = await verify();
    const doctorPubId = formData?.get("doctor_pubId");
    const name = formData?.get("name")?.replace(/\s/g, "-").toLowerCase();
    const username = formData?.get("username");
    const newPassword = formData?.get("new_password");
    const department = formData?.get("department")?.replace(/\s/g, "-").toLowerCase();
    const qualification = formData.get("qualification")?.toString().split(/[ ,]+/).filter(Boolean).map(q => q.trim().toLowerCase());

    if (!doctorPubId || !name || !department || !username) return { message: "Missing fields" };

    try {
        const doctorId = await getDoctorId(doctorPubId, adminId);
        if (!doctorId) return { message: "Doctor not found" };

        if (newPassword) {
            const passwordHash = await hash(newPassword);
            await Promise.all([
                db.execute(
                    `UPDATE doctors SET password = ?, name = ?, username = ?, department = ?, qualifications = ? WHERE id = ? AND admin_id = ?`,
                    [passwordHash, name, username, department, JSON.stringify(qualification), doctorId, adminId]
                ),
                db.execute(
                    `UPDATE users SET password = ?, username = ? WHERE doctor_id = ?`,
                    [passwordHash, username, doctorId]
                )
            ]);
        } else {
            await db.execute(
                `UPDATE doctors SET name = ?, username = ?, department = ?, qualifications = ? WHERE id = ? AND admin_id = ?`,
                [name, username, department, JSON.stringify(qualification), doctorId, adminId]
            );
            await db.execute(`UPDATE users SET username = ? WHERE doctor_id = ?`, [username, doctorId]);
        }
    } catch (error) {
        return { message: "Database error" };
    }
    redirect(`/edit-doctor/${doctorPubId}`);
}

export async function removeDoctorTreatment(prevState, formData) {
    const adminId = await verify();
    const doctorPubId = formData?.get("doctor_pubId");
    const treatmentPubId = formData?.get("remove_treatment");
    if (!doctorPubId || !treatmentPubId) return { message: "Missing IDs" };
    try {
        const doctorId = await getDoctorId(doctorPubId, adminId);
        const treatmentId = await getTreatmentId(treatmentPubId, adminId);
        if (!doctorId || !treatmentId) return { message: "Not found" };
        await db.execute(
            `DELETE FROM doctor_treatments WHERE doctor_id = ? AND treatment_id = ? AND admin_id = ?`,
            [doctorId, treatmentId, adminId]
        );
    } catch (error) {
        return { message: "Database error" };
    }
    redirect(`/edit-doctor/${doctorPubId}`);
}

export async function addDoctorTreatment(prevState, formData) {
    const adminId = await verify();
    const doctorPubId = formData?.get("doctor_pubId");
    const treatmentPubId = formData?.get("treatment");
    if (!doctorPubId || !treatmentPubId) return { message: "Missing IDs" };
    try {
        const doctorId = await getDoctorId(doctorPubId, adminId);
        const treatmentId = await getTreatmentId(treatmentPubId, adminId);
        if (!doctorId || !treatmentId) return { message: "Not found" };
        await db.execute(
            `INSERT OR IGNORE INTO doctor_treatments (public_id, admin_id, doctor_id, treatment_id) VALUES (?, ?, ?, ?)`,
            [nanoid(12), adminId, doctorId, treatmentId]
        );
    } catch (error) {
        return { message: "Database error" };
    }
    redirect(`/edit-doctor/${doctorPubId}`);
}

export async function deleteDoctor(prevState, formData) {
    const adminId = await verify();
    const doctorPubId = formData?.get("doctor_pubId");
    if (!doctorPubId) return { message: "Missing ID" };
    try {
        const doctorId = await getDoctorId(doctorPubId, adminId);
        if (!doctorId) return { message: "Not found" };
        await db.execute(`DELETE FROM doctors WHERE id = ? AND admin_id = ?`, [doctorId, adminId]);
    } catch (error) {
        return { message: "Database error" };
    }
    redirect(`/add-doctor`);
}