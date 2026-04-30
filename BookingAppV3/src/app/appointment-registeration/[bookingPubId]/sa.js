"use server";

import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { hash } from "@/app/utils/bcrypt";
import { sendEmail } from "@/app/lib/resend";

export async function appointmentRegisterationServerAction(_, formData) {

    const adminId = 1;

    const bookingPubId = formData.get("bookingPubId");
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    if (!bookingPubId || !name || !email || !phone) throw new Error("Missing required fields.");


    if ((!name.match(/^[a-zA-Z\s]+$/)) || name.length > 20 || name.length < 3) return { ok: false, message: "Name should only contain letters and spaces and should be 3-20 characters long." };

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) throw new Error("Invalid email.");

    if (phone.length > 15 || phone.length < 7) throw new Error("Invalid phone number.");

    const email_token = crypto.randomBytes(16).toString("hex");
    const hashed = await hash(email_token);

    try {
        const fetch = await db.execute(`SELECT id FROM bookings WHERE public_id = ? AND admin_id = ?`, [bookingPubId, adminId]);
        if (fetch.rows.length === 0) throw new Error("Invalid booking.");

        await db.execute(`UPDATE bookings SET patient_name = ?, patient_email = ?, patient_phone = ?, status = ?, email_token_hash = ?, email_token_created_at = CURRENT_TIMESTAMP WHERE id = ? AND admin_id = ?`, [name, email, phone, "unverified", hashed, fetch.rows[0].id, adminId]);

        const subject = `Book Your Slot`;
        const to = email;
        const html = `
        <p>Click on button to verify your email address.</p>
        <a href="https://portfolio-lw35.vercel.app/verify/${email_token}/${bookingPubId}">Verify Email</a>
        `;

        const res = await sendEmail({ to, subject, html });
        if (res.success === false) throw new Error(res.error);


    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message || "An unexpected error occurred." };
    }
    redirect(`/message/${bookingPubId}`);
}
