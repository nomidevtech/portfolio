'use server'

import { randomUUID } from 'crypto'
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";

import { db } from '@/app/Lib/turso';
import verifyUser from '@/app/Lib/verifyUser';




export async function loginActionServer(prevState, formData) {
    try {

        const username = formData.get('username');
        const password = formData.get('password');

        if (!username || !password) return { ok: false, message: 'username and password required' };

        const isUserVerfied = await verifyUser(username, password);

        if (!isUserVerfied.ok) return { ok: false, message: 'username and password did not match' };

        const token = randomUUID();

        const resultSession = await db.execute(`INSERT INTO sessions (user_id, token) VALUES (?, ?)`, [isUserVerfied.user.id, token]);

        const cookieStore = await cookies();

        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

    } catch (err) {
        console.log(err)
        return {
            ok: false,
            error: err.message || "Failed to login",
        };
    }

    redirect("/blog");

}