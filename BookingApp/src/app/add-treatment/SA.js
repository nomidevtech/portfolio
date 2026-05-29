"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { nanoid } from "nanoid";
import { getUserPlus } from "../lib/getUser";

export async function addTreatmentServerAction(_, formData) {

    const currentUser = await getUserPlus();
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) {
        return { ok: false, message: "Unauthorized: Admin access required" };
    }
    const adminId = currentUser.admin_id;
    try {
        const name = formData.get("name")?.toString().trim().toLowerCase().replace(/\s+/g, "_");
        const duration = Number(formData.get("duration")) || 0;

        if (!name || duration <= 0) return { ok: false, message: "Invalid name or duration" };

        const existing = await db.execute(
            `SELECT id FROM treatments WHERE admin_id = ? AND name = ?`,
            [adminId, name]
        );
        if (existing.rows.length > 0) return { ok: false, message: "A treatment with this name already exists." };

        await db.execute(`INSERT INTO treatments (admin_id, name, duration, public_id) VALUES (?, ?, ?, ?)`, [adminId, name.toLowerCase(), duration, nanoid(12)]);

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
    redirect("/add-treatment");
}

export async function deleteTreatmentSA(formData) {
    const currentUser = await getUserPlus();
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id)
        return { ok: false, message: "Unauthorized" };
    const adminId = currentUser.admin_id;
    const publicId = formData.get("publicId")?.toString();
    if (!publicId) return { ok: false, message: "Missing treatment ID" };

    try {
        // Resolve internal id
        const t = await db.execute(
            `SELECT id FROM treatments WHERE public_id = ? AND admin_id = ?`,
            [publicId, adminId]
        );
        if (t.rows.length === 0) return { ok: false, message: "Treatment not found" };
        const treatmentId = t.rows[0].id;

        // Guard: upcoming active bookings
        const today = new Date().toISOString().split("T")[0];
        const future = await db.execute(
            `SELECT COUNT(*) as count FROM bookings
             WHERE treatment_id = ? AND booking_date_iso >= ? AND status IN ('pending','verified','unverified')`,
            [treatmentId, today]
        );
        const count = future.rows[0].count;
        if (count > 0)
            return { ok: false, message: `Cannot delete: ${count} upcoming booking${count > 1 ? "s" : ""} use this treatment. Cancel them first.` };

        await db.execute(
            `DELETE FROM treatments WHERE public_id = ? AND admin_id = ?`,
            [publicId, adminId]
        );
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
    redirect("/add-treatment");
}

export async function editTreatmentSA(_, formData) {
    const currentUser = await getUserPlus();
    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id)
        return { ok: false, message: "Unauthorized" };
    const adminId = currentUser.admin_id;

    const publicId = formData.get("publicId")?.toString();
    const name = formData.get("name")?.toString().trim().toLowerCase().replace(/\s+/g, "_");
    const duration = Number(formData.get("duration")) || 0;

    if (!publicId || !name || duration <= 0)
        return { ok: false, message: "Invalid name or duration" };

    try {
        // Collision check — exclude self
        const collision = await db.execute(
            `SELECT id FROM treatments WHERE admin_id = ? AND name = ? AND public_id != ?`,
            [adminId, name, publicId]
        );
        if (collision.rows.length > 0)
            return { ok: false, message: "A treatment with this name already exists." };

        await db.execute(
            `UPDATE treatments SET name = ?, duration = ? WHERE public_id = ? AND admin_id = ?`,
            [name, duration, publicId, adminId]
        );
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
    redirect("/add-treatment");
}