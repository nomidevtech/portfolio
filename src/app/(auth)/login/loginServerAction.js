'use server'

import { randomUUID } from 'crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from "next/navigation";

import { db } from '@/app/Lib/turso';
import verifyUser from '@/app/Lib/verifyUser';
import { redis } from '@/app/Lib/redis';

export async function loginActionServer(_, formData) {
    try {
        const getHeaders = await headers();
        const rawIp = getHeaders.get('x-forwarded-for');
        const ip = rawIp?.split(',')[0].trim() || '127.0.0.1';

        const maxAttempts = 5;
        const blockTime = 15 * 60;
        const key = `login:attempt:${ip}`;
        const attempts = parseInt(await redis.get(key)) || 0;

        if (attempts >= maxAttempts) throw new Error('Too many attempts; try again in 15 minutes');

        const username = formData.get('username')?.trim();
        const password = formData.get('password')?.trim();


        if (!username || !password) throw new Error('provide username and password');

        const isUserVerified = await verifyUser(username, password);

        if (!isUserVerified.ok) {
            await redis.incr(key);
            if (attempts === 0) await redis.expire(key, blockTime);
            throw new Error('Invalid credentials');
        }

        await redis.del(key);

        const token = randomUUID();
        await db.execute(`INSERT INTO sessions (user_id, token) VALUES (?, ?)`, [isUserVerified.userId, token]);

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });



    } catch (err) {
        console.log(err);
        return {
            ok: false,
            message: err.message || "Failed to login",
        };
    }
    redirect("/blog");
}