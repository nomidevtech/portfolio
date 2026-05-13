"use server";

import crypto from "crypto";
import { db } from "@/app/lib/turso";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, } from "@/app/utils/bcrypt";
import { redisIpLimit } from "@/app/lib/redis";






export async function loginSA(_, formData) {
    try {

        const redisLimit = await redisIpLimit(5, "login", 60 * 15);
        if (!redisLimit.ok) return { ok: false, message: redisLimit.message };


        const username = formData.get("username")?.trim();
        const password = formData.get("password");

        if (!username) return { ok: false, message: "Username or email required" };
        if (!password) return { ok: false, message: "Password required" };

        const fetchUser = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (fetchUser.rows.length === 0) return { ok: false, message: "Invalid credentials" };

        const user = fetchUser.rows[0];
        const passwordHash = user.password;

        const isPasswordValid = await compare(password, passwordHash);

        if (!isPasswordValid) return { ok: false, message: "credentials" };


        if (user.status !== "verified") return { ok: false, message: "Please verify your email before logging in." };


        const sessionToken = crypto.randomBytes(64).toString("hex");

        const cookieStore = await cookies();

        cookieStore.set("token", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 14
        });

        const d = new Date();
        d.setDate(d.getDate() + 14);
        const expires = d.toISOString();

        await db.execute(`INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)`, [sessionToken, user.id, expires]);



    } catch (error) {

        console.error(error);

        return {
            ok: false,
            message: "Internal server error"
        };
    }

    redirect("/");
}