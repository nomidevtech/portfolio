"use server";

import crypto from "crypto";
import { db } from "@/app/lib/turso";
import { cookies, headers } from "next/headers";
import { redis } from "@/app/lib/redis";
import { redirect } from "next/navigation";  // ← fixed import
import { initSessionsTable } from "@/app/models/table-inits";




export async function loginSA(_, formData) {  // ← prevState added for useActionState
    try {
        const username = formData.get("username")?.trim();
        const password = formData.get("password");

        if (!username) {
            return { ok: false, message: "Username or email required" };
        }

        if (!password) {
            return { ok: false, message: "Password required" };
        }

        const headerStore = await headers();
        const rawIp = headerStore.get("x-forwarded-for");
        const ip = rawIp?.split(",")[0].trim() || '127.0.0.1';
        const maxAttempts = 5;
        const blockTime = 60 * 15;
        const key = `login:attempt:${ip}`;
        const currentAttempts = parseInt(await redis.get(key)) || 0;
        if (currentAttempts >= maxAttempts) return { ok: false, message: `Too many attempts. Try again in 15 minutes` };



        const result = await db.execute(
            `SELECT id, password
             FROM admins
             WHERE username = ? 
             LIMIT 1`,
            [username]
        );

        if (result.rows.length === 0) {

            const attempts = await redis.incr(key);

            if (attempts === 1) {
                await redis.expire(key, blockTime);
            }

            return {
                ok: false,
                message: `Invalid username or password. ${maxAttempts - attempts} attempts left`
            };
        }



        const user = result.rows[0];

        const userId = user.id;
        const loginPassword = user.password;

        const isPasswordValid = loginPassword === password;


        if (!isPasswordValid) {

            const attempts = await redis.incr(key);

            if (attempts === 1) {
                await redis.expire(key, blockTime);
            }

            return {
                ok: false,
                message: `Invalid username or password. ${maxAttempts - attempts} attempts left`
            };
        }

        await redis.del(key);

        const sessionToken =
            crypto.randomBytes(32).toString("hex");


        const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 14;

        await initSessionsTable();
        await db.execute(
            `INSERT INTO sessions (session_id, admin_id, expires_at)
             VALUES (?, ?, ?)`,
            [sessionToken, userId, expiresAt]
        );

        const cookieStore = await cookies();

        cookieStore.set("isp-token", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 14
        });



    } catch (error) {

        console.error(error);

        return {
            ok: false,
            message: "Internal server error"
        };
    }

    redirect("/");
}