"use server";

import { db } from "@/app/lib/turso";
import { getUser } from "../lib/getUser";

export async function settingsServerAction(_, formData) {
    try {
        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, message: "You must be logged in" };

        const userPublicId = formData.get("public_id")?.toString().trim();
        const username = formData.get("username")?.toString().trim() || null;
        const email = formData.get("email")?.toString().trim() || null;
        const password = formData.get("password")?.toString().trim() || null;
        const newPassword = formData.get("new_password")?.toString().trim() || null;

        if (!username || !password) return { ok: false, message: "username and password are required" };

        if (currentUser.public_id !== userPublicId) return { ok: false, message: "User details conflict" };

        const fetchPass = await db.execute(`SELECT password FROM admins WHERE id = ?`, [currentUser.id]);
        const currentPassword = fetchPass.rows[0].password;

        if (password !== currentPassword) return { ok: false, message: "Incorrect password" };

        if (newPassword) {
            await db.execute(`UPDATE admins SET password = ? WHERE id = ?`, [newPassword, currentUser.id]);
        }

        await db.execute(`UPDATE admins SET username = ?, email = ? WHERE id = ?`, [username, email, currentUser.id]);

        return { ok: true, message: "Settings updated successfully" };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error updating settings" };
    }
}