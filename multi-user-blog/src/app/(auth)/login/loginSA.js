"use server";

import crypto from "crypto";
import { db } from "@/app/lib/turso";
import { compare} from "@/app/utils/bcrypt";
import { cookies, headers } from "next/headers";
import { redis } from "@/app/lib/redis";
import { redirect } from "next/navigation";  // ← fixed import

// ----- Init tables -----
// await db.execute(`
//     CREATE TABLE IF NOT EXISTS sessions (
//         id         INTEGER PRIMARY KEY AUTOINCREMENT,
//         session_id TEXT    NOT NULL UNIQUE,
//         user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         expires_at TEXT    NOT NULL,
//         created_at TEXT    NOT NULL DEFAULT (datetime('now'))
//     )
// `);



export async function loginSA(_, formData) {  // ← prevState added for useActionState

    // ----- 1. Read inputs -----
    const identifier = formData.get("username_or_email")?.trim();
    const password = formData.get("password");

    if (!identifier) {
        return { ok: false, message: "Username or email required" };
    }

    if (!password) {
        return { ok: false, message: "Password required" };
    }



    // ----- 2. Determine client IP -----
    const headerStore = await headers();

    const rawIp = headerStore.get("x-forwarded-for");
    const ip = rawIp?.split(",")[0].trim() || '127.0.0.1';


    // ----- 3. Rate limit check -----
    const maxAttempts = 5;
    const blockTime = 60 * 15;

    const key = `login:attempt:${ip}`;

    const currentAttempts = parseInt(await redis.get(key)) || 0;

    if (currentAttempts >= maxAttempts) {
        return {
            ok: false,
            message: `Too many attempts. Try again in 15 minutes`
        };
    }



    try {

        // ----- 4. Fetch user (single query path) -----
        const result = await db.execute(
            `SELECT id, password
             FROM users
             WHERE username = ? OR email = ?
             LIMIT 1`,
            [identifier, identifier]
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
        const hashedPassword = user.password;



        // ----- 5. Password comparison -----
        const isPasswordValid =
            await compare(password, hashedPassword);

        if (!isPasswordValid) {

            const attempts = await redis.incr(key);

            if (attempts === 1) {
                await redis.expire(key, blockTime);
            }

            return {
                ok: false,
                message: `Invalid username or password. ${maxAttempts - attempts + 1} attempts left`
            };
        }



        // ----- 6. Reset rate limit -----
        await redis.del(key);



        // ----- 7. Create session token -----
        const sessionToken =
            crypto.randomBytes(32).toString("hex");



        // 14 day lifetime
        const expiresAt =
            new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
                .toISOString();



        await db.execute(
            `INSERT INTO sessions (session_id, user_id, expires_at)
             VALUES (?, ?, ?)`,
            [sessionToken, userId, expiresAt]
        );



        // ----- 8. Set cookie -----
        const cookieStore = await cookies();

        cookieStore.set("mub-session-token", sessionToken, {
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

    // ----- 9. Redirect (must be outside try/catch) -----
    redirect("/");
}