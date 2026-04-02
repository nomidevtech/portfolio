"use server"

import { cookies } from "next/headers";
import { db } from "./turso";
import { cache } from "react";


export const getUser = cache(async function getUser() {

    try {


        const cookieStore = await cookies();
        const token = cookieStore.get('isp-token');


        if (!token) return null;

        const sessionRes = await db.execute(
            'SELECT admin_id FROM sessions WHERE session_id = ?',
            [token.value]
        );


        if (sessionRes.rows.length === 0) return null;

        const userId = sessionRes.rows[0].admin_id;

        const userRes = await db.execute(
            'SELECT id, public_id, username, email FROM admins WHERE id = ?',
            [userId]
        );


        if (userRes.rows.length === 0) return null;


        return userRes.rows[0];

    } catch (error) {
        console.error(error);
        return null;
    }
})