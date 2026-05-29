"use server";

import { cookies } from "next/headers";
import { db } from "./turso";

export async function getUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        if (!token) return null;

        const fetchSession = await db.execute("SELECT * FROM sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP", [token.value]);
        if (fetchSession.rows.length === 0) return null;

        const fetchUser = await db.execute(
            "SELECT id, public_id, admin_id, doctor_id, role, username, status FROM users WHERE id = ?",
            [fetchSession.rows[0].user_id]
        );
        if (fetchUser.rows.length === 0) return null;

        const user = fetchUser;

        return user.rows[0];

    } catch (error) {
        console.error(error);
        return null;
    }
}


export async function getUserPlus() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        if (!token) return null;

        const fetchSession = await db.execute("SELECT * FROM sessions WHERE session_id = ? AND expires_at > CURRENT_TIMESTAMP", [token.value]);
        if (fetchSession.rows.length === 0) return null;

        const fetchUser = await db.execute(
            "SELECT id, public_id, admin_id, doctor_id, role, username, status FROM users WHERE id = ?",
            [fetchSession.rows[0].user_id]
        );
        if (fetchUser.rows.length === 0) return null;

        const user = fetchUser.rows[0];

        if (user.role === "admin") {
            const fetchAdmin = await db.execute(
                "SELECT id, public_id, admin_name, admin_email, admin_username, clinic_name, clinic_phone, clinic_address, status FROM admins WHERE id = ?",
                [user.admin_id]
            );
            if (fetchAdmin.rows.length === 0) return null;
            user.admin_details = fetchAdmin.rows[0];
        }
        if (user.role === "doctor") {
            const fetchDoctor = await db.execute(
                "SELECT id, public_id, admin_id, name, username, qualifications, department, status FROM doctors WHERE id = ?",
                [user.doctor_id]
            );
            if (fetchDoctor.rows.length === 0) return null;
            user.doctor_details = fetchDoctor.rows[0];
        }

        return user;



    } catch (error) {
        console.error(error);
        return null;
    }
}