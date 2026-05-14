"use server";

import { redisIpLimit } from "@/app/lib/redis";
import { db } from "@/app/lib/turso";
import { hash, compare } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";

export async function updateAdminPassword(_, formData) {
    try {
        const redisLimit = await redisIpLimit(5, "updateAdminPass", 60 * 15);
        if (!redisLimit.ok) return { ok: false, message: redisLimit.message };

        const adminPubId = formData.get("adminPubId");
        const recoveryToken = formData.get("recoveryToken");
        const password = formData.get("password");
        const confirm_password = formData.get("confirm_password");

        if (!adminPubId || !recoveryToken || !password || !confirm_password) {
            return { ok: false, message: "Invalid submission" };
        }

        if (password.length < 8 || password.length > 64) {
            return { ok: false, message: "Password must be between 8 and 64 characters" };
        }

        if (password !== confirm_password) {
            return { ok: false, message: "Passwords do not match" };
        }

        const fetchAdminData = await db.execute("SELECT * FROM admins WHERE public_id = ? AND recovery_token_hash IS NOT NULL", [adminPubId]);
        if (fetchAdminData.rows.length === 0) return { ok: false, message: "Invalid or expired recovery link." };

        const admin = fetchAdminData.rows[0];

        if (!admin.recovery_token_hash || !admin.recovery_token_created_at) {
            return { ok: false, message: "Invalid or expired recovery link." };
        }

        const tokenAge = Date.now() - new Date(admin.recovery_token_created_at).getTime();
        if (tokenAge > 1000 * 60 * 60 * 24) {
            return { ok: false, message: "Recovery link expired." };
        }

        const match = await compare(recoveryToken, admin.recovery_token_hash);
        if (!match) {
            return { ok: false, message: "Invalid recovery token." };
        }

        const hashedPassword = await hash(password, 12);

        const fetchUserId = await db.execute("SELECT id FROM users WHERE admin_id = ?", [admin.id]);
        if (fetchUserId.rows.length === 0) return { ok: false, message: "Something went wrong" };

        const user = fetchUserId.rows[0];

        await db.batch([
            {
                sql: "UPDATE admins SET password = ?, recovery_token_hash = null, recovery_token_created_at = null WHERE public_id = ?",
                args: [hashedPassword, adminPubId]
            },
            {
                sql: "UPDATE users SET password = ? WHERE admin_id = ?",
                args: [hashedPassword, admin.id]
            },
            {
                sql: "DELETE FROM sessions WHERE user_id = ?",
                args: [user.id]
            }
        ]);
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
    redirect("/login");
}