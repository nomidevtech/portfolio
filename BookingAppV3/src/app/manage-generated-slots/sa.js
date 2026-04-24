"use server";

import { db } from "../lib/turso";

export async function toggleSlotStatus(public_id) {
    try {
        if (!public_id) return null;

        const adminId = 1;

        const fetchSlot = await db.execute(
            `SELECT id, status FROM slots WHERE public_id = ? AND admin_id = ?`,
            [public_id, adminId]
        );

        if (fetchSlot.rows.length === 0) return null;

        const currentSlot = fetchSlot.rows[0];
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
}