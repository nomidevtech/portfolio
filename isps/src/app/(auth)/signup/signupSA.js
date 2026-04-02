"use server";
import { nanoid } from "nanoid";
import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import { redisIpLimit } from "@/app/utils/redidIpLimit";

export async function signuptServerAction(_, formData) {


    const username = formData.get('username')?.trim().replace(/\s+/g, '').toLowerCase();
    const password = formData.get('password')?.trim();
    const confirmPassword = formData.get('confirmPassword')?.trim();

    if (!username || !password || !confirmPassword) {
        return { ok: false, message: 'All fields are required' };
    }


    if (password !== confirmPassword) {
        return { ok: false, message: 'Passwords do not match' };
    }

    const ipLimit = await redisIpLimit(5, 'signup_check');
    if (!ipLimit.ok) return ipLimit;

    try {

        const user_pid = nanoid(12);

        const result = await db.execute(`
            INSERT INTO admins (public_id, username, password)
            VALUES (?, ?, ?)
        `, [user_pid, username, password]);

        if (result.rowsAffected === 0) {
            return { ok: false, message: 'Something went wrong' };
        }


    } catch (error) {
        console.error(error);
        return { ok: false, message: 'something went wrong while signing up' };
    }

    redirect('/login');
}