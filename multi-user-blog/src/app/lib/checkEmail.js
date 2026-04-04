"use server";

import { db } from "@/app/lib/turso";
import { redisIpLimit } from "../utils/redidIpLimit";

export async function checkEmail(_, email) {
    if (!email) return { ok: false, message: 'Email is required' };

    const ipLimit = await redisIpLimit(5, 'email_check');
    if (!ipLimit.ok) return ipLimit;


    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return { ok: false, message: 'Please enter a valid email address' };
    }

    try {
        const result = await db.execute(`SELECT COUNT(*) as count FROM users WHERE email = ?`, [email]);

        if (result.rows[0].count !== 0) return { ok: false, message: 'Email is already in use' };

        return { ok: true, message: 'Email is available' };
    } catch (error) {
        console.error(error);
        return { ok: false, message: 'Something went wrong' };
    }
}