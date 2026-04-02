"use server";

import { db } from "@/app/lib/turso";

export async function checkAdminNameServerAction(_, username) {

    try {
        if (!username) return { ok: false, message: "Username is required" };

        const result = await db.execute(`SELECT COUNT(*) as count FROM admins WHERE username = ?`, [username]);

        if (result.rows[0].count !== 0) return { ok: false, message: 'Username already in use' };

        return { ok: true, username, message: 'Username is available', username };

    } catch (error) {
        console.error(error);
        return { ok: false, message: 'Error checking username' };
    }
}