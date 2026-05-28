"use server";

import { db } from "@/app/lib/turso";
import { redisIpLimit } from "@/app/utils/redidIpLimit";
import {
  normalizeUsername,
  validateUsername,
} from "@/app/utils/validation";

export async function checkAdminNameServerAction(_, usernameRaw) {

    const ipLimit = await redisIpLimit(20, "admin_username_check");
    if (!ipLimit.ok) return ipLimit;

    try {
        const username = normalizeUsername(usernameRaw);

        const usernameError = validateUsername(username);
        if (usernameError) {
            return { ok: false, username, message: usernameError };
        }

        const result = await db.execute(`SELECT COUNT(*) as count FROM admins WHERE username = ?`, [username]);

        if (result.rows[0].count !== 0) {
            return { ok: false, username, message: "Username already in use" };
        }

        return { ok: true, username, message: "Username is available" };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error checking username" };
    }
}