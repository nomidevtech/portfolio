"use server";

import { cookies } from "next/headers";
import { compare } from "../utils/bcrypt";
import { db } from "./turso";

export async function getUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        if (!token) return null;

        const fetchSession = await db.execute("SELECT * FROM sessions WHERE session_id = ?", [token.value]);
        if (fetchSession.rows.length === 0) return null;

        const fetchUser = await db.execute("SELECT * FROM users WHERE id = ?", [fetchSession.rows[0].user_id]);
        if (fetchUser.rows.length === 0) return null;

        const user = fetchUser;

        return user.rows[0];

    } catch (error) {
        console.error(error);
        throw error;
    }
}