"use server";

import { db } from "@/app/lib/turso";
import { getUser } from "../lib/getUser";
import { hashPassword, verifyPassword } from "@/app/utils/hash";

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

        if (!verifyPassword(password, currentPassword)) return { ok: false, message: "Incorrect password" };

        if (newPassword) {
            if (newPassword.length < 6) {
                return { ok: false, message: "New password must be at least 6 characters long" };
            }
            const hashedPassword = hashPassword(newPassword);
            await db.execute(`UPDATE admins SET password = ? WHERE id = ?`, [hashedPassword, currentUser.id]);
        }

        await db.execute(`UPDATE admins SET username = ?, email = ? WHERE id = ?`, [username, email, currentUser.id]);

        return { ok: true, message: "Settings updated successfully" };

    } catch (error) {
        console.error(error);
        if (error.message && error.message.includes("UNIQUE")) {
            return { ok: false, message: "Username already in use" };
        }
        return { ok: false, message: "Error updating settings" };
    }
}