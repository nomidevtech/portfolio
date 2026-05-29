"use server";

import { db } from "@/app/lib/turso";
import { redisIpLimit } from "../utils/redidIpLimit";

export async function checkUsername(_, username) {
    username = username?.trim();

    if (!username) return { ok: false, message: 'Username is required' };
    if (username.length < 3) return { ok: false, message: 'Username must be at least 3 characters' };
    if (username.length > 30) return { ok: false, message: 'Username must be at most 30 characters' };

    const ipLimit = await redisIpLimit(30, 'username_check');
    if (!ipLimit.ok) return ipLimit;

    try {
        const result = await db.execute(`SELECT COUNT(*) as count FROM users WHERE username = ?`, [username]);

        if (result.rows[0].count !== 0) return { ok: false, message: 'Username is already taken' };

        return { ok: true, message: 'Username is available' };
    } catch (error) {
        console.error(error);
        return { ok: false, message: 'Something went wrong' };
    }
}