"use server";

import { db } from "@/app/lib/turso";
import { getUser } from "./getUser";

import {
  normalizeUsername,
  validateUsername,
} from "@/app/utils/validation";

export async function checkUsernameServerAction(_, usernameRaw) {

    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, message: "You must be logged in" };
    const adminId = currentUser.id;

    try {
        const username = normalizeUsername(usernameRaw);

        const usernameError = validateUsername(username);
        if (usernameError) {
            return { ok: false, username, message: usernameError };
        }

        const result = await db.execute(`SELECT COUNT(*) as count FROM users WHERE admin_id = ? AND username = ?`, [adminId, username]);

        const count = Number(result.rows[0]?.count ?? 0);

        if (count !== 0) {
            return { ok: false, username, message: "Username already in use" };
        }

        return { ok: true, username, message: "Username is available" };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error checking username" };
    }
}