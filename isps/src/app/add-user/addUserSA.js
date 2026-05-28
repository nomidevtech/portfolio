"use server";

import crypto from "crypto";
import { db } from "@/app/lib/turso";
import { nanoid } from "nanoid";
import { getUser } from "../lib/getUser";
import {
    normalizeUsername,
    validateUsername,
    validateOptionalPassword,
} from "@/app/utils/validation";
import { redisIpLimit } from "@/app/utils/redidIpLimit";

export async function addUserServerAction(_, formData) {

    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, message: "You must be logged in" };

    const ipLimit = await redisIpLimit(10, "add_user");
    if (!ipLimit.ok) return ipLimit;

    try {
        const username = normalizeUsername(formData.get("username"));
        const planPublicId = formData.get("plan_public_id")?.toString().trim();
        let password = formData.get("password")?.toString() || null;
        const contactRaw = formData.get("contact")?.toString().trim();

        if (!planPublicId) {
            return { ok: false, message: "Plan is required" };
        }

        const usernameError = validateUsername(username);
        if (usernameError) {
            return { ok: false, message: usernameError };
        }

        const passwordError = validateOptionalPassword(password, "Password");
        if (passwordError) {
            return { ok: false, message: passwordError };
        }

        let contact = 0;
        if (contactRaw) {
            contact = Number(contactRaw);
            if (!Number.isFinite(contact) || contact <= 0) {
                return { ok: false, message: "Contact must be a valid number" };
            }
        }

        // Auto-generate strong password if left blank
        if (!password) {
            password = Math.floor(100000 + Math.random() * 900000).toString();
        }

        const adminId = currentUser.id;

        const fetchPlanDetails = await db.execute(`SELECT id FROM plans WHERE admin_id = ? AND public_id = ?`, [adminId, planPublicId]);
        if (fetchPlanDetails.rows.length === 0) {
            return { ok: false, message: "Select a valid plan" };
        }

        const planId = fetchPlanDetails.rows[0].id;

        const result = await db.execute(
            `INSERT INTO users (public_id, admin_id, username, password, contact, plan_id) 
                VALUES (?, ?, ?, ?, ?, ?)`,
            [nanoid(12), adminId, username, password, contact, planId]
        );

        if (result.rowsAffected === 0) return { ok: false, message: "Error adding user" };

        return { ok: true, message: "User added successfully" };
    } catch (error) {
        console.error(error);
        if (error.message && error.message.includes("UNIQUE")) {
            return { ok: false, message: "Username already exists" };
        }
        return { ok: false, message: "Error adding user" };
    }
}