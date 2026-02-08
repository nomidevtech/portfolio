'use server'

import { db } from "@/app/Lib/turso";
import { verifyPassword } from "@/app/Lib/passwordVerification";
import { randomUUID } from 'crypto'
import { cookies } from "next/headers";
import { userVerification } from "@/app/Lib/userVerification";



export async function userValidation(prevState, formData) {
    try {

        console.log(formData)

        const username = formData.get('username');
        const password = formData.get('password');

        if (!username || !password) return { ok: false, message: 'username and password required' };

        const isUserExist = await userVerification(username);

        if (!isUserExist.ok) return { ok: false, message: 'user does not exist' };

        const storedHash = isUserExist.user.password;

        const passMatch = await verifyPassword(password, storedHash);

        if (!passMatch.ok) return { ok: passMatch.ok, message: passMatch.message }


        const token = randomUUID();

        const result2 = await db.execute(`INSERT INTO sessions (token, user_id) VALUES(?, ?)`, [token, isUserExist.user.id]);


        const cookieStore = await cookies();

        cookieStore.set("session-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });



        return {
            ok: true,
            message: "Login successfully!",
            redirectTo: '/add-post'
        };

    } catch (err) {
        console.log(err)
        return {
            ok: false,
            error: err.message || "Failed to create post",
        };
    }

}