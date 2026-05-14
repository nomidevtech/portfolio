"use server";

import { hash } from "../utils/bcrypt";
import { redisIpLimit } from "./redis";
import { sendEmail } from "./resend";
import { db } from "./turso";
import crypto from "crypto";

export async function resendingAdminEmail(_, formData) {

    const apiLimit = await redisIpLimit(25, "resendingAdminEmail", 60 * 15);
    if (!apiLimit.ok) return { ok: false, message: apiLimit.message };

    const adminPubId = formData.get("adminPubId");
    if (!adminPubId) return { ok: false, message: "Missing required fields." };

    const fetchAdmin = await db.execute(`SELECT id, admin_email FROM admins WHERE public_id = ? AND status = 'unverified'`, [adminPubId]);
    if (fetchAdmin.rows.length === 0) return { ok: false, message: "Invalid admin." };
    const adminId = fetchAdmin.rows[0].id;

    const new_email_token = crypto.randomBytes(32).toString("hex");
    const hashed = await hash(new_email_token);

    try {

        await db.execute(`UPDATE admins SET email_token_hash = ?, email_token_created_at = CURRENT_TIMESTAMP WHERE id = ? `, [hashed, adminId]);



        const subject = `Account Verification`;
        const to = fetchAdmin.rows[0]?.admin_email;
        const html = `
           <p>Click on button to verify your email address.</p>
           <a href="${process.env.NEXT_PUBLIC_APP_URL}/activation/${new_email_token}/${adminPubId}">Activate Account</a>
           `;

        const res = await sendEmail({ to, subject, html });
        if (res.success === false) return { ok: false, message: "Email service error." };

        return { ok: true, message: "Email sent successfully." };


    } catch (error) {
        console.error(error);
        return { ok: false, message: "An unexpected error occurred." };
    }

}



export async function resendingPatientEmail(_, formData) {

    const apiLimit = await redisIpLimit(25, "resendingPatientEmail", 60 * 15);
    if (!apiLimit.ok) return { ok: false, message: apiLimit.message };


    const bookingPubId = formData.get("bookingPubId");
    const adminPubId = formData.get("adminPubId");
    if (!bookingPubId || !adminPubId) return { ok: false, message: "Missing required fields." };

    const fetchAdmin = await db.execute(`SELECT id FROM admins WHERE public_id = ?`, [adminPubId]);
    if (fetchAdmin.rows.length === 0) return { ok: false, message: "Invalid admin." };
    const adminId = fetchAdmin.rows[0].id;

    const new_email_token = crypto.randomBytes(16).toString("hex");
    const hashed = await hash(new_email_token);

    try {

        const fetch = await db.execute(`SELECT patient_email FROM bookings WHERE admin_id = ? AND public_id = ? AND status = 'unverified'`, [adminId, bookingPubId]);
        if (fetch.rows.length === 0) throw new Error("Invalid booking.");

        await db.execute(`UPDATE bookings SET email_token_hash = ?, email_token_created_at = CURRENT_TIMESTAMP WHERE admin_id = ? AND public_id = ?`, [hashed, adminId, bookingPubId]);



        const subject = `Book Your Slot`;
        const to = fetch?.rows[0]?.patient_email;
        const html = `
           <p>Click on button to verify your email address.</p>
           <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify/${new_email_token}/${bookingPubId}/${adminPubId}">Verify Email</a>
           `;

        const res = await sendEmail({ to, subject, html });
        if (res.success === false) throw new Error(res.error);

        return { ok: true, message: "Email sent successfully." };


    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message || "An unexpected error occurred." };
    }

}