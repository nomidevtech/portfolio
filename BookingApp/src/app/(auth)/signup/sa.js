"use server";

import { sendEmail } from "@/app/lib/resend";
import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { redisIpLimit } from "@/app/lib/redis";

export async function signupServerAction(prevState, formData) {
    let public_id = nanoid(12);

    try {
        const redisLimit = await redisIpLimit(5, "signup", 60 * 15);
        if (!redisLimit.ok) return { ok: false, message: redisLimit.message };

        const admin_name = formData.get("full_name")?.toString().trim();
        const admin_email = formData.get("admin_email")?.toString().trim();
        const username = formData.get("username")?.toString().trim().replace(/\s+/g, '-');
        const password = formData.get("password")?.toString();
        const confirm_password = formData.get("confirm_password")?.toString();
        const clinic_name = formData.get("clinic_name")?.toString().trim();
        const clinic_phone = formData.get("clinic_phone")?.toString().trim();
        const clinic_address = formData.get("clinic_address")?.toString().trim();

        if (!admin_name || admin_name.length < 2 || admin_name.length > 20) return { ok: false, message: "Name must be between 2 and 20 characters" };
        if (!admin_email || !admin_email?.includes("@") || admin_email.length < 5 || admin_email.length > 100) return { ok: false, message: "Invalid email address" };
        if (!username || username.length < 3 || username.length > 20) return { ok: false, message: "Username must be between 3 and 20 characters" };
        if (!password || password.length < 8 || password.length > 64) return { ok: false, message: "Password must be between 8 and 64 characters" };
        if (password !== confirm_password) return { ok: false, message: "Passwords do not match" };
        if (!clinic_name || !clinic_phone) return { ok: false, message: "Clinic name and phone are required" };

        const [userCheck, emailCheck] = await Promise.all([
            db.execute("SELECT 1 FROM users WHERE username = ? LIMIT 1", [username]),
            db.execute("SELECT 1 FROM admins WHERE admin_email = ? LIMIT 1", [admin_email])
        ]);

        if (userCheck.rows.length > 0) return { ok: false, message: "Username already exists" };
        if (emailCheck.rows.length > 0) return { ok: false, message: "Email already exists" };

        const hashedPassword = await hash(password);
        const email_token = crypto.randomBytes(32).toString("hex");
        const hashedToken = await hash(email_token);

        const results = await db.batch([
            {
                sql: `INSERT INTO admins (public_id, admin_name, admin_email, admin_username, clinic_name, clinic_phone, clinic_address, password, email_token_hash, email_token_created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING id`,
                args: [
                    public_id,
                    admin_name.toLowerCase().replace(/\s+/g, '-'),
                    admin_email,
                    username,
                    clinic_name.toLowerCase().replace(/\s+/g, '-'),
                    clinic_phone,
                    clinic_address.toLowerCase().replace(/\s+/g, '-'),
                    hashedPassword,
                    hashedToken
                ]
            },
            {
                sql: `INSERT INTO users (public_id, admin_id, role, username, password) 
                      VALUES (?, last_insert_rowid(), ?, ?, ?)`,
                args: [nanoid(12), "admin", username, hashedPassword]
            }
        ], "write");

        if (results[0].rowsAffected === 0 || results[1].rowsAffected === 0) return { ok: false, message: "An error occurred during registration" };

        await sendEmail({
            to: admin_email,
            subject: "Account Activation",
            html: `<p>Click to activate your account:</p><a href="${process.env.NEXT_PUBLIC_APP_URL}/activation/${email_token}/${public_id}">Activate Account</a>`
        });

    } catch (error) {
        console.error(error);
        return { ok: false, message: "An error occurred during registration" };
    }

    redirect(`/verification/${public_id}`);
}