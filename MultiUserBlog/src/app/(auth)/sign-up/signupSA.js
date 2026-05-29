"use server";
import { nanoid } from "nanoid";
import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { emailOrchestrator } from "@/app/lib/resend";
import { redisIpLimit } from "@/app/utils/redidIpLimit";


export async function signuptServerAction(_, formData) {

    




    const name = formData.get('name')?.trim();
    const username = formData.get('username')?.trim();
    const email = formData.get('email')?.trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (!name || !username || !email || !password || !confirmPassword) {
        return { ok: false, message: 'All fields are required' };
    }

    if (name.length < 2 || name.length > 60) {
        return { ok: false, message: 'Name must be between 2 and 60 characters' };
    }

    if (username.length < 3 || username.length > 30) {
        return { ok: false, message: 'Username must be between 3 and 30 characters' };
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
        if (error?.message?.includes('UNIQUE')) {
            return { ok: false, message: 'Username or email is already in use.' };
        }
        return { ok: false, message: 'Something went wrong while signing up.' };
    }

    redirect('/login');
}