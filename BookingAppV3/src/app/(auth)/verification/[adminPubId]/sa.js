"use server";

import { sendEmail } from "@/app/lib/resend";
import { db } from "@/app/lib/turso";
import { redisIpLimit } from "@/app/lib/redis";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { hash } from "@/app/utils/bcrypt";

export async function changeAdminEmailSA(_, formData) {
    const redisLimit = await redisIpLimit(5, "changeAdminEmail", 60 * 15);
    if (!redisLimit.ok) return { ok: false, message: redisLimit.message };

    const adminPubId = formData.get("adminPubId");
    const email = formData.get("email");

    try {
        if (!email || !adminPubId) return { ok: false, message: "Email required" };

        const fetchAdmin = await db.execute("SELECT id, admin_email FROM admins WHERE public_id = ? AND status = 'unverified'", [adminPubId]);
        if (fetchAdmin.rows.length === 0) return { ok: false, message: "Admin not found" };

        const emailCheck = await db.execute("SELECT 1 FROM admins WHERE admin_email = ? LIMIT 1", [email]);
        if (emailCheck.rows.length > 0) return { ok: false, message: "Email already taken" };

        const email_token = crypto.randomBytes(32).toString("hex");
        const hashed = await hash(email_token);

        const updateResult = await db.execute("UPDATE admins SET admin_email = ?, email_token_hash = ?, email_token_created_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'unverified'", [email, hashed, fetchAdmin.rows[0].id]);

        if (updateResult.rowsAffected === 0) return { ok: false, message: "Try again or change your email" };

        const subject = "Account Activation";
        const html = `<p>Click on button to activate your account.</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/activation/${email_token}/${adminPubId}">Activate Account</a>`;
        await sendEmail({ to: email, subject, html });

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }

    redirect(`/verification/${adminPubId}`);
}