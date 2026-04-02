"use server";

import { db } from "@/app/lib/turso";
import { getUser } from "./getUser";

export async function checkUsernameServerAction(_, username) {

    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, message: "You must be logged in" };
    const adminId = currentUser.id;

    try {
        if (!username) return { ok: false, message: "Username is required" };

        const result = await db.execute(`SELECT COUNT(*) as count FROM users WHERE admin_id = ? AND username = ?`, [adminId, username]);

        if (result.rows[0].count !== 0) return { ok: false, message: 'Username already in use' };

        return { ok: true, username, message: 'Username is available' };

    } catch (error) {
        console.error(error);
        return { ok: false, message: 'Error checking username' };
    }
}