"use server";
import { nanoid } from "nanoid";
import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import { redisIpLimit } from "@/app/utils/redidIpLimit";
import { hashPassword } from "@/app/utils/hash";

export async function signuptServerAction(_, formData) {

    const username = formData.get('username')?.trim().replace(/\s+/g, '').toLowerCase();
    const password = formData.get('password')?.trim();
    const confirmPassword = formData.get('confirmPassword')?.trim();

    if (!username || !password || !confirmPassword) {
        return { ok: false, message: 'All fields are required' };
    }

    if (username.length < 3) {
        return { ok: false, message: 'Username must be at least 3 characters long' };
    }

    if (password.length < 6) {
        return { ok: false, message: 'Password must be at least 6 characters long' };
    }

    if (password !== confirmPassword) {
        return { ok: false, message: 'Passwords do not match' };
    }

    const ipLimit = await redisIpLimit(5, 'signup_check');
    if (!ipLimit.ok) return ipLimit;

    try {

        const user_pid = nanoid(12);
        const hashedPassword = hashPassword(password);

        const result = await db.execute(`
            INSERT INTO admins (public_id, username, password)
            VALUES (?, ?, ?)
        `, [user_pid, username, hashedPassword]);

        if (result.rowsAffected === 0) {
            return { ok: false, message: 'Something went wrong' };
        }


    } catch (error) {
        console.error(error);
        if (error.message && error.message.includes("UNIQUE")) {
            return { ok: false, message: 'Username already in use' };
        }
        return { ok: false, message: 'something went wrong while signing up' };
    }

    redirect('/login');
}