"use server";

import { db } from "@/app/lib/turso";
import { nanoid } from "nanoid";
import { getUser } from "../lib/getUser";
import { redisIpLimit } from "@/app/utils/redidIpLimit";

export async function plansServerAction(_, formData) {

    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, message: "You must be logged in" };

    const adminId = currentUser.id;

    const ipLimit = await redisIpLimit(15, "plans_action");
    if (!ipLimit.ok) return ipLimit;

    try {
        const actionType = formData.get("action_type")?.toString();
        const planId = formData.get("public_id")?.toString().trim();
        const speedRaw = formData.get("speed")?.toString().trim();
        const rateRaw = formData.get("rate")?.toString().trim();

        if (!["add", "update", "delete"].includes(actionType)) {
            return { ok: false, message: "Invalid request" };
        }

        // DELETE branch
        if (actionType === "delete") {
            if (!planId) {
                return { ok: false, message: "Select a plan to delete" };
            }

            const result = await db.execute(
                `DELETE FROM plans WHERE public_id = ? AND admin_id = ?`,
                [planId, adminId]
            );

            if (result.rowsAffected === 0) {
                return { ok: false, message: "Error deleting plan" };
            }

            return { ok: true, message: "Plan deleted successfully" };
        }

        // ADD and UPDATE validation
        if (!speedRaw || !rateRaw) {
            return { ok: false, message: "Speed and rate are required" };
        }

        const speed = Number(speedRaw);
        const rate = Number(rateRaw);

        if (!Number.isFinite(speed) || speed <= 0) {
            return { ok: false, message: "Speed must be a valid positive number" };
        }

        if (!Number.isFinite(rate) || rate <= 0) {
            return { ok: false, message: "Rate must be a valid positive number" };
        }

        if (speed > 10000) {
            return { ok: false, message: "Speed seems unrealistic (max 10000 Mbps)" };
        }

        if (rate > 1000000) {
            return { ok: false, message: "Rate seems unrealistic (max 1,000,000)" };
        }

        // ADD branch
        if (actionType === "add") {
            if (planId) {
                return { ok: false, message: "Invalid request" };
            }

            const result = await db.execute(
                `INSERT INTO plans (public_id, speed, rate, admin_id) VALUES (?, ?, ?, ?)`,
                [nanoid(), speed, rate, adminId]
            );

            if (result.rowsAffected === 0) {
                return { ok: false, message: "Error adding new plan" };
            }

            return { ok: true, message: "New plan added successfully" };
        }

        // UPDATE branch
        if (actionType === "update") {
            if (!planId) {
                return { ok: false, message: "Select a plan to update" };
            }

            const result = await db.execute(
                `UPDATE plans SET speed = ?, rate = ? WHERE public_id = ? AND admin_id = ?`,
                [speed, rate, planId, adminId]
            );

            if (result.rowsAffected === 0) {
                return { ok: false, message: "Error updating plan" };
            }

            return { ok: true, message: "Plan updated successfully" };
        }

        return { ok: false, message: "Invalid request" };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
}