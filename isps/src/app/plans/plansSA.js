"use server";

import { db } from "@/app/lib/turso";
import { nanoid } from "nanoid";
import { getUser } from "../lib/getUser";


export async function plansServerAction(_, formData) {

    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, message: "You must be logged in" };

    const adminId = currentUser.id;

    const planId = formData.get("public_id")?.toString().trim();

    const speedRaw = formData.get("speed")?.toString().trim();
    const rateRaw = formData.get("rate")?.toString().trim();

    const speed = speedRaw ? Number(speedRaw) : null;
    const rate = rateRaw ? Number(rateRaw) : null;

    try {

        if (!planId && speed && rate) {
            const result = await db.execute(
                `INSERT INTO plans (public_id, speed, rate, admin_id) VALUES (?, ?, ?, ?)`,
                [nanoid(), speed, rate, adminId]
            );

            if (result.rowsAffected === 0) {
                return { ok: false, message: "Error adding new plan" };
            }

            return { ok: true, message: "New plan added successfully" };
        }

        if (planId && speed && rate) {
            const result = await db.execute(
                `UPDATE plans SET speed = ?, rate = ? WHERE public_id = ? AND admin_id = ?`,
                [speed, rate, planId, adminId]
            );

            if (result.rowsAffected === 0) {
                return { ok: false, message: "Error updating plan" };
            }

            return { ok: true, message: "Plan updated successfully" };
        }

        if (planId && !speed && !rate) {
            const result = await db.execute(
                `DELETE FROM plans WHERE public_id = ? AND admin_id = ?`,
                [planId, adminId]
            );

            if (result.rowsAffected === 0) {
                return { ok: false, message: "Error deleting plan" };
            }

            return { ok: true, message: "Plan deleted successfully" };
        }

        return { ok: false, message: "Invalid request" };

    } catch (error) {
        console.log(error);
        return { ok: false, message: "Something went wrong" };
    }
}