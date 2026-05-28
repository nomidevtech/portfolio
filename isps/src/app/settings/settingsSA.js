"use server";

import { db } from "@/app/lib/turso";
import { getUser } from "../lib/getUser";
import { hashPassword, verifyPassword } from "@/app/utils/hash";

import {
  normalizeUsername,
  validateUsername,
  validateAdminPassword,
  validateOptionalAdminPassword,
  validateEmail,
} from "@/app/utils/validation";
import { redisIpLimit } from "@/app/utils/redidIpLimit";

export async function settingsServerAction(_, formData) {
    try {
        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, message: "You must be logged in" };

        const ipLimit = await redisIpLimit(10, "settings_update");
        if (!ipLimit.ok) return ipLimit;

        const userPublicId = formData.get("public_id")?.toString().trim();
        const username = normalizeUsername(formData.get("username"));
        const email = formData.get("email")?.toString().trim() || null;
        const password = formData.get("password")?.toString();
        const newPassword = formData.get("new_password")?.toString() || null;

        const usernameError = validateUsername(username);
        if (usernameError) {
            return { ok: false, message: usernameError };
        }

        const emailError = validateEmail(email);
        if (emailError) {
            return { ok: false, message: emailError };
        }

        const passwordError = validateAdminPassword(password, "Current password");
        if (passwordError) {
            return { ok: false, message: passwordError };
        }

        const newPasswordError = validateOptionalAdminPassword(newPassword, "New password");
        if (newPasswordError) {
            return { ok: false, message: newPasswordError };
        }

        if (currentUser.public_id !== userPublicId) return { ok: false, message: "User details conflict" };

        const fetchPass = await db.execute(`SELECT password FROM admins WHERE id = ?`, [currentUser.id]);
        if (fetchPass.rows.length === 0) {
            return { ok: false, message: "Account not found" };
        }
        const currentPassword = fetchPass.rows[0].password;

        if (!verifyPassword(password, currentPassword)) return { ok: false, message: "Incorrect password" };

        await db.execute(`UPDATE admins SET username = ?, email = ? WHERE id = ?`, [username, email, currentUser.id]);

        if (newPassword) {
            const hashedPassword = hashPassword(newPassword);
            await db.execute(`UPDATE admins SET password = ? WHERE id = ?`, [hashedPassword, currentUser.id]);
        }

        return { ok: true, message: "Settings updated successfully" };

    } catch (error) {
        console.error(error);
        if (error.message && error.message.includes("UNIQUE")) {
            return { ok: false, message: "Username already in use" };
        }
        return { ok: false, message: "Error updating settings" };
    }
}