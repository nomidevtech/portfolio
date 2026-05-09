"use server";

import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";

export async function updateAdminPassword(formData) {
    try {
        const adminPubId = formData.get("adminPubId");
        const password = formData.get("password");
        const confirm_password = formData.get("confirm_password");

        if (!adminPubId || !password || !confirm_password || password !== confirm_password)
            return { ok: false, message: "Invalid password" };

        const fetchAdminData = await db.execute("SELECT * FROM admins WHERE public_id = ?", [adminPubId]);
        if (fetchAdminData.rows.length === 0) return { ok: false, message: "Admin not found" };

        const admin = fetchAdminData.rows[0];

        const hashedPassword = await hash(password, 12);

        await Promise.all([
            db.execute(
                "UPDATE admins SET password = ?, recovery_token_hash = null, recovery_token_created_at = null WHERE public_id = ?",
                [hashedPassword, adminPubId]
            ),
            db.execute(
                "UPDATE users SET password = ? WHERE admin_id = ?",
                [hashedPassword, admin.id]
            ),
        ]);

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
    redirect("/login");
}