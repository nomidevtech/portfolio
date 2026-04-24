"use server";

import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import getMinutes from "@/app/utils/getMinutes";
import { revalidatePath } from "next/cache";

export async function editSlotServerAction(formData) {
    const adminId = 1;

    const slotPubId = formData.get("slotPubId");
    if (!slotPubId) redirect("/edit-template");

    const fetchSlot = await db.execute(`SELECT * FROM slots WHERE public_id = ? AND admin_id = ?`, [slotPubId, adminId]);
    if (fetchSlot?.rows.length === 0) redirect("/edit-slot");

    const startTimeFromUser = getMinutes(formData.get("startHr"), formData.get("startMin"), formData.get("startMeridiem"));
    const endTimeFromUser = getMinutes(formData.get("endHr"), formData.get("endMin"), formData.get("endMeridiem"));
    const breakStartromUser = getMinutes(formData.get("breakStartHr"), formData.get("breakStartMin"), formData.get("breakStartMeridiem"));
    const breakEndromUser = getMinutes(formData.get("breakEndHr"), formData.get("breakEndMin"), formData.get("breakEndMeridiem"));

    const bufferTimeromUser = formData.get("buffer");
    const statusromUser = formData.get("status");

    if (startTimeFromUser === null || endTimeFromUser === null || breakStartromUser === null || breakEndromUser === null || !bufferTimeromUser || !statusromUser) {
        redirect("/edit-template");
    }

    const { id, status, start_time, end_time, break_start, break_end, buffer_minutes } = fetchSlot.rows[0];

    if (status === statusromUser && start_time === startTimeFromUser && end_time === endTimeFromUser && break_start === breakStartromUser && break_end === breakEndromUser && buffer_minutes === Number(bufferTimeromUser)) {
        redirect(`/edit-slot/${slotPubId}`);
    }

    try {
        await db.execute(
            `UPDATE slots SET status = ?, start_time = ?, end_time = ?, break_start = ?, break_end = ?, buffer_minutes = ? WHERE id = ?`,
            [statusromUser, startTimeFromUser, endTimeFromUser, breakStartromUser, breakEndromUser, Number(bufferTimeromUser), id]
        );
    } catch (e) {
        console.error("Update failed:", e);
        throw new Error("Could not update template");
    }

    revalidatePath(`/edit-slot/${slotPubId}`);
    redirect(`/edit-slot/${slotPubId}`);
}