"use server";

import { db } from "@/app/lib/turso";
import crypto from "crypto";
import { hash } from "@/app/utils/bcrypt";
import { sendEmail } from "@/app/lib/resend";
import { redisIpLimit } from "@/app/lib/redis";

export async function findEMail(_, formData) {
    try {

        const redisLimit = await redisIpLimit(5, "request_recovery_email", 60 * 15);
        if (!redisLimit.ok) return { ok: false, message: redisLimit.message };

        const emailFromClient = formData.get("email");
        if (!emailFromClient) return { ok: false, message: "Email required" };

        const result = await db.execute("SELECT * FROM admins WHERE admin_email = ?", [emailFromClient]);
        if (result.rows.length === 0) return { ok: false, message: "If that email exists, a reset link has been sent" };

        const admin = result.rows[0];
        const userEmail = admin.admin_email;

        const recovery_token = crypto.randomBytes(32).toString("hex");
        const hashed = await hash(recovery_token);

        await db.execute(
            "UPDATE admins SET recovery_token_hash = ?, recovery_token_created_at = CURRENT_TIMESTAMP WHERE admin_email = ?",
            [hashed, userEmail]
        );

        const to = userEmail;
        const subject = "Password Recovery";
        const html = `<p>Click on button to reset your password.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/recovery/${recovery_token}/${admin.public_id}">Reset Password</a>`;

        await sendEmail({ to, subject, html });

        return { ok: true, message: "If that email exists, a reset link has been sent" };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
}