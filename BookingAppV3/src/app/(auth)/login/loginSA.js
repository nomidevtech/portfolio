"use server";

import crypto from "crypto";
import { db } from "@/app/lib/turso";
import { cookies, headers } from "next/headers";
//import { redis } from "@/app/lib/redis";
import { redirect } from "next/navigation";  // ← fixed import
import { compare, hash } from "@/app/utils/bcrypt";
import { initSessionsTable } from "@/app/Models/initTables";
//import { initSessionsTable } from "@/app/models/table-inits";




export async function loginSA(_, formData) {  // ← prevState added for useActionState
    try {

        await initSessionsTable();
        const username = formData.get("username")?.trim();
        const password = formData.get("password");

        if (!username) return { ok: false, message: "Username or email required" };
        if (!password) return { ok: false, message: "Password required" };

        const fetchUser = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (fetchUser.rows.length === 0) return { ok: false, message: "User not found" };

        const user = fetchUser.rows[0];
        const passowrdHash = user.password;

        const isPasswordValid = await compare(password, passowrdHash);
        if (!isPasswordValid) return { ok: false, message: "Invalid password" };


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