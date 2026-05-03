"use server";

import { getUserPlus } from "@/app/lib/getUser";
import { db } from "@/app/lib/turso";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

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
    if (result.rows.length === 0) return null;
    return result.rows[0].id;
}

async function getTreatmentId(treatmentStr, adminId) {
    if (!treatmentStr) return null;
    const parts = treatmentStr.split(" - ");
    if (parts.length !== 2) return null;
    const name = parts[0]?.toLowerCase();
    const duration = parseInt(parts[1]);
    if (!name || isNaN(duration)) return null;
    const result = await db.execute(
        `SELECT id FROM treatments WHERE LOWER(name) = ? AND duration = ? AND admin_id = ?`,
        [name, duration, adminId]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0].id;
}

export async function editDoctorServerAction(formData) {

    const adminId = await verify();
    if (!adminId) return null;


    const doctorPubId = formData?.get("doctor_pubId");
    const name = formData?.get("name");
    const department = formData?.get("department");
    const qualification = formData.get("qualification")?.toString().split(/[ ,]+/).filter(Boolean).map(q => q.trim().toLowerCase());

    if (!doctorPubId || !name || !department) return null;

    try {
        const doctorId = await getDoctorId(doctorPubId, adminId);
        if (!doctorId) return null;

        await db.execute(
            `UPDATE doctors SET name = ?, department = ?, qualifications = ? WHERE id = ? AND admin_id = ?`,
            [name.toLowerCase(), department.toLowerCase(), JSON.stringify(qualification), doctorId, adminId]
        );
    } catch (error) {
        console.error(error);
        return null;
    }
    redirect(`/edit-doctor/${doctorPubId}`);
}

export async function removeDoctorTreatment(formData) {

    const adminId = await verify();
    if (!adminId) return null;

    const doctorPubId = formData?.get("doctor_pubId");
    const treatmentStr = formData?.get("remove_treatment");
    if (!doctorPubId || !treatmentStr) return null;
    try {
        const doctorId = await getDoctorId(doctorPubId, adminId);
        const treatmentId = await getTreatmentId(treatmentStr, adminId);
        if (!doctorId || !treatmentId) return null;
        await db.execute(
            `DELETE FROM doctor_treatments WHERE doctor_id = ? AND treatment_id = ? AND admin_id = ?`,
            [doctorId, treatmentId, adminId]
        );
    } catch (error) {
        console.error(error);
        return null;
    }
    redirect(`/edit-doctor/${doctorPubId}`);
}

export async function addDoctorTreatment(formData) {

    const adminId = await verify();
    if (!adminId) return null;

    const doctorPubId = formData?.get("doctor_pubId");
    const treatmentStr = formData?.get("treatment");
    if (!doctorPubId || !treatmentStr) return null;
    try {
        const doctorId = await getDoctorId(doctorPubId, adminId);
        const treatmentId = await getTreatmentId(treatmentStr, adminId);
        if (!doctorId || !treatmentId) return null;
        await db.execute(
            `INSERT OR IGNORE INTO doctor_treatments (public_id, admin_id, doctor_id, treatment_id) VALUES (?, ?, ?, ?)`,
            [nanoid(12), adminId, doctorId, treatmentId]
        );
    } catch (error) {
        console.error(error);
        return null;
    }
    redirect(`/edit-doctor/${doctorPubId}`);
}

export async function deleteDoctor(formData) {

    const adminId = await verify();
    if (!adminId) return null;

    const doctorPubId = formData?.get("doctor_pubId");
    if (!doctorPubId) return null;
    try {
        const doctorId = await getDoctorId(doctorPubId, adminId);
        if (!doctorId) return null;
        await db.execute(`DELETE FROM doctors WHERE id = ? AND admin_id = ?`, [doctorId, adminId]);
    } catch (error) {
        console.error(error);
        return null;
    }
    redirect(`/add-doctor`);
}