import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./turso";

export default async function getSession() {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return { ok: false, message: 'no token found' };

    try {

        const result = (await db.execute(`SELECT * FROM sessions where token = ?`, [token])).rows[0];

        if (!result) return { ok: false, message: 'no session found. Please login' };

        return { ok: true, message: 'session found', session: result };


    } catch (err) {
        console.log(err);
        return { ok: false, message: err }
    }
} 