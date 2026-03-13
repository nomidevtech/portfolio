"use server";
import { nanoid } from "nanoid";
import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { emailOrchestrator } from "@/app/lib/resend";


export async function submitServerAction(_, formData) {
    const name = formData.get('name')?.trim().toUpperCase();
    const username = formData.get('username')?.trim().replace(/\s+/g, '').toLowerCase();
    const email = formData.get('email')?.trim();
    const password = formData.get('password')?.trim();
    const confirmPassword = formData.get('confirmPassword')?.trim();

    if (!name || !username || !email || !password || !confirmPassword) return { ok: false, error: 'All fields are required' };
    if (password !== confirmPassword) return { ok: false, message: 'Passwords do not match' };


    try {

        const hashPassword = await hash(password);
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashToken = await hash(rawToken);
        const user_pid = nanoid();


        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            public_id TEXT,
            name TEXT,
            username TEXT UNIQUE,
            role TEXT DEFAULT 'user',
            email TEXT UNIQUE,
            email_verified BOOLEAN DEFAULT 0,
            email_token TEXT,
            password TEXT,
            CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const result = await db.execute(`
        INSERT INTO users (public_id, name, username, email, email_token, password) VALUES (
            ?, ?, ?, ?, ?, ? ) 
    `, [user_pid, name, username, email, hashToken, hashPassword]);

        if (result.rowsAffected === 0) return { ok: false, message: 'Something went wrong' };

        const sendingVerificationEmail = await emailOrchestrator(email);

        if (sendingVerificationEmail.error) return { ok: false, message: sendingVerificationEmail.error.message };

        // return { ok: true, emailSent: true, message: 'Account created successfully. Verification email sent' };




    } catch (error) {
        console.error(error);

        return { ok: false, message: error.message };
    }

    redirect('/login');
};