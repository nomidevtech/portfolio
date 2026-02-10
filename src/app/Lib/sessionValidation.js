'use server'

import { db } from "./turso";



const sessionValidation = async (token) => {
    try {
        if (!token) {
            return { ok: false, message: "Missing token" };
        }

        const session = (
            await db.execute(
                `SELECT user_id FROM sessions WHERE token = ?`,
                [token]
            )
        ).rows[0];

        if (!session) {
            return { ok: false, message: "You need to login" };
        }



        return { ok: true, message: 'user session found', userID: session.user_id };

    } catch (err) {
        return { ok: false, message: err.message || "session for user not found" };
    }
};

export { sessionValidation };