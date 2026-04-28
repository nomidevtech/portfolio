"use server";

import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";

export async function appointmentRegisterationServerAction(formData) {
    const bookingPubId = formData.get("bookingPubId");
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    if (!bookingPubId || !name || !email || !phone) return null;

    try {
        const fetch = await db.execute(`SELECT id FROM bookings WHERE public_id = ?`, [bookingPubId]);
        if (fetch.rows.length === 0) return null;

        await db.execute(`UPDATE bookings SET patient_name = ?, patient_email = ?, patient_phone = ?, status = ? WHERE id = ?`, [name, email, phone, "unverified", fetch.rows[0].id,]);

    } catch (error) {
        console.error(error);
        return null;
    }
    redirect(`/message/${bookingPubId}`);
}
