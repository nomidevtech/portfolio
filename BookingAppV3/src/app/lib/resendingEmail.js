"use server";

import { hash } from "../utils/bcrypt";
import { sendEmail } from "./resend";
import { db } from "./turso";
import crypto from "crypto";

export async function resendingEmail(_, formData) {

    const adminId = 1;

    const bookingPubId = formData.get("bookingPubId");
    if (!bookingPubId) throw new Error("Missing required fields.");

    const new_email_token = crypto.randomBytes(16).toString("hex");
    const hashed = await hash(new_email_token);

    try {

        const fetch = await db.execute(`SELECT patient_email FROM bookings WHERE public_id = ?`, [bookingPubId]);
        if (fetch.rows.length === 0) throw new Error("Invalid booking.");

        await db.execute(`UPDATE bookings SET email_token_hash = ?, email_token_created_at = CURRENT_TIMESTAMP WHERE admin_id = ? AND public_id = ?`, [hashed, adminId, bookingPubId]);



        const subject = `Book Your Slot`;
        const to = fetch?.rows[0]?.patient_email;
        const html = `
           <p>Click on button to verify your email address.</p>
           <a href="https://portfolio-lw35.vercel.app/verify/${new_email_token}/${bookingPubId}">Verify Email</a>
           `;

        const res = await sendEmail({ to, subject, html });
        if (res.success === false) throw new Error(res.error);

        return { ok: true, message: "Email sent successfully." };


    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message || "An unexpected error occurred." };
    }

}