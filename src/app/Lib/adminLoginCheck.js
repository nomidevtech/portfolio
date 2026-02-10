'use server'

import { cookies } from "next/headers";
import { sessionValidation } from "./sessionValidation";
import { db } from "./turso";



const adminLoginCheck = async () => {

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const sessionResult = await sessionValidation(token);

    if (!sessionResult.ok) {
        return sessionResult;
    }

    const userID = sessionResult.userID;

    const user = (
        await db.execute(
            `SELECT id, role, username FROM users WHERE id = ?`,
            [userID]
        )
    ).rows[0];

    if (!user) {
        return { ok: false, message: "User does not exist" };
    }


    if (user.role !== "admin") {
        return { ok: false, message: "admin not found" };
    }

    return { ok: true, message: "Admin verified", username: `${user.username}` };
};

export { adminLoginCheck };