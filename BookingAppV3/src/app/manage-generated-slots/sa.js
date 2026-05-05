"use server";

import { getUser } from "../lib/getUser";
import { sendBulkCancelationEmails } from "../lib/resend";
import { sendCancelationEmails } from "../lib/sendCancelationEmail";
import { db } from "../lib/turso";


export async function toggleSlotStatus(slotPubId) {
    try {
        if (!slotPubId) return null;

        const currentUser = await getUser();
        if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) return null;

        const adminId = currentUser.admin_id;

        const fetchSlot = await db.execute(
            "SELECT id, status, full_date_at_period FROM slots WHERE public_id = ? AND admin_id = ?",
            [slotPubId, adminId]
        );

        if (fetchSlot.rows.length === 0) return null;

        const currentSlot = fetchSlot.rows[0];

        const slotDateIso = currentSlot.full_date_at_period.split("T")[0];

        const getAndUpdateBookings = await db.execute(
            `UPDATE bookings SET status = 'revoked' WHERE admin_id = ? AND booking_date_iso = ? AND status != 'revoked' RETURNING patient_email, patient_name, doctor_name`, [adminId, slotDateIso]);

        if (getAndUpdateBookings.rows.length > 0) {
            await sendCancelationEmails(getAndUpdateBookings.rows, 100);
        }


        const newStatus = currentSlot.status === 'active' ? 'inactive' : 'active';

        await db.execute(
            `UPDATE slots SET status = ? WHERE id = ? AND admin_id = ?`,
            [newStatus, currentSlot.id, adminId]
        );

        return { ok: true, status: newStatus };
    } catch (error) {
        console.error(error);
        return null;
    }
};







