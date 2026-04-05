"use server";
import { nanoid } from "nanoid";
import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { emailOrchestrator } from "@/app/lib/resend";
import { redisIpLimit } from "@/app/utils/redidIpLimit";


export async function signuptServerAction(_, formData) {

    




    const name = formData.get('name')?.trim().toUpperCase();
    const username = formData.get('username')?.trim().replace(/\s+/g, '').toLowerCase();
    const email = formData.get('email')?.trim();
    const password = formData.get('password')?.trim();
    const confirmPassword = formData.get('confirmPassword')?.trim();

    if (!name || !username || !email || !password || !confirmPassword) {
        return { ok: false, message: 'All fields are required' };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) return { ok: false, message: 'Invalid email format' };

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordPattern.test(password)) {
        return { ok: false, message: 'Password must be at least 8 characters, include uppercase, lowercase, and a number' };
    }

    if (password !== confirmPassword) {
        return { ok: false, message: 'Passwords do not match' };
    }

    const ipLimit = await redisIpLimit(5, 'signup_check');
    if (!ipLimit.ok) return ipLimit;

    try {
        const hashPassword = await hash(password);

        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashToken = await hash(rawToken);

        const user_pid = nanoid();

        const result = await db.execute(`
            INSERT INTO users (public_id, name, username, email, email_token, password)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [user_pid, name, username, email, hashToken, hashPassword]);

        if (result.rowsAffected === 0) {
            return { ok: false, message: 'Something went wrong' };
        }

        const sendingVerificationEmail =
            await emailOrchestrator(user_pid, email, rawToken);

        if (sendingVerificationEmail.error) {
            return { ok: false, message: sendingVerificationEmail.error.message };
        }

    } catch (error) {
        console.error(error);
        return { ok: false, message: 'something went wrong while signing up' };
    }

    redirect('/login');
}