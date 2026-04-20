"use server"

import { getSession } from "../utils/getSession";
import { db } from "./turso";

export async function getUser() {

    try {

        const session = await getSession("mub-session-token");
        if (!session) return null;

        const sessionRes = await db.execute(
            'SELECT user_id FROM sessions WHERE session_id = ? AND expires_at > ?',
            [session, Date.now()]
        );

        if (sessionRes.rows.length === 0) return null;

        const userId = sessionRes.rows[0].user_id;

        const userRes = await db.execute('SELECT id, public_id, name, username, email, role, email_verified FROM users WHERE id = ?', [userId]);

        if (userRes.rows.length === 0) return null;

        return userRes.rows[0];

    } catch (error) {
        console.error(error);
        return null;
    }
}