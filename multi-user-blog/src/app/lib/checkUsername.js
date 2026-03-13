"use server";

import { db } from "@/app/lib/turso";

export async function checkUsername(_, username) {
    if (!username) return { ok: false, message: 'Username is required' };
    if (username.length < 3) return { ok: false, message: 'Username must be at least 3 characters' };
    if (username.length > 20) return { ok: false, message: 'Username must be at most 20 characters' };
    if (!username.match(/^[a-zA-Z0-9_-]+$/)) return { ok: false, message: 'Username must only contain letters, numbers, hyphen  and underscores' };

    try {
        const result = await db.execute(`SELECT COUNT(*) as count FROM users WHERE username = ?`, [username]);

        if (result.rows[0].count !== 0) return { ok: false, message: 'Username is already taken' };

        return { ok: true, message: 'Username is available' };
    } catch (error) {
        console.error(error);
        return { ok: false, message: 'Something went wrong' };
    }
}