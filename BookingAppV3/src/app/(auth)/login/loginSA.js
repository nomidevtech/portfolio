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
        if (!isPasswordValid) return { ok: false, message: "Invalid credentials" };

        let adminPubId = null;

        if (user.role === "admin") {
            const fetchAdminPublicId = await db.execute("SELECT public_id FROM admins WHERE id = ?", [user.admin_id]);
            if (fetchAdminPublicId.rows.length === 0) return { ok: false, message: "Invalid credentials" };
            adminPubId = fetchAdminPublicId.rows[0].public_id;
        }
        if (user.role === "doctor") {
            const fetchAdminPublicId = await db.execute("SELECT admins.public_id AS admin_public_id FROM doctors LEFT JOIN admins ON doctors.admin_id = admins.id WHERE doctors.id = ?", [user.doctor_id]);
            if (fetchAdminPublicId.rows.length === 0) return { ok: false, message: "Invalid credentials" };
            adminPubId = fetchAdminPublicId.rows[0].admin_public_id;
        }


        if (user.status !== "verified") return { ok: false, message: "Please verify your email before logging in.", redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verification/${adminPubId}` };


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
        const expires = d.toISOString().slice(0, 19).replace('T', ' ');

        await db.execute(
            "DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP"
        );

        await db.execute(`INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)`, [sessionToken, user.id, expires]);



    } catch (error) {

        console.error(error);

        return {
            ok: false,
            message: "Internal server error"
        };
    }

    redirect("/dashboard");
}