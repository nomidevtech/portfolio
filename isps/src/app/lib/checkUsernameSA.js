"use server";

import { db } from "@/app/lib/turso";

export async function checkUsernameServerAction(_, username) {


    // when add auth. then get user from cookies and if username is same as the input then return condtional message



    try {
        if (!username) return { ok: false, message: "Username is required" };

        const result = await db.execute(`SELECT COUNT(*) as count FROM users WHERE username = ?`, [username]);

        if (result.rows[0].count !== 0) return { ok: false, message: 'Username already in use' };

        return { ok: true, username, message: 'Username is available' };

    } catch (error) {
        console.error(error);
        return { ok: false, message: 'Error checking username' };
    }
}