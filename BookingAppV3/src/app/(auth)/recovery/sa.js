"use server";

import { db } from "@/app/lib/turso";
import crypto from "crypto";
import { hash } from "@/app/utils/bcrypt";
import { sendEmail } from "@/app/lib/resend";

export async function findEMail(_, formData) {
    try {
        const emailFromClient = formData.get("email");
        if (!emailFromClient) return { ok: false, message: "Email required" };

        const result = await db.execute("SELECT * FROM admins WHERE admin_email = ?", [emailFromClient]);
        if (result.rows.length === 0) return { ok: false, message: "Email not found" };

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

        return { ok: true, message: "Recovery link sent to " + userEmail };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
}