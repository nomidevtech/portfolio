'use server'

import { db } from "./turso";

// this function return user objects if a sessions exist for them in db.

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

        const user = (
            await db.execute(
                `SELECT id, role FROM users WHERE id = ?`,
                [session.user_id]
            )
        ).rows[0];

        if (!user) {
            return { ok: false, message: "User does not exist" };
        }

        return { ok: true, message: 'user session found', user };

    } catch (err) {
        return { ok: false, message: err.message || "session for user not found" };
    }
};

export { sessionValidation };