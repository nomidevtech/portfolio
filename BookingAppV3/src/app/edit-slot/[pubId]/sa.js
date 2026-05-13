"use server";

import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import getMinutes from "@/app/utils/getMinutes";
import { revalidatePath } from "next/cache";
import { getUserPlus } from "@/app/lib/getUser";
import { sendCancellationEmails } from "@/app/lib/sendCancellationEmail";

export async function editSlotServerAction(formData) {
    const currentUser = await getUserPlus();

    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) {
        redirect("/login");
    }

    const adminId = currentUser.admin_id;

    const slotPubId = formData.get("slotPubId");

    if (!slotPubId) {
        redirect("/edit-template");
    }

    const fetchSlot = await db.execute(
        `SELECT * FROM slots WHERE public_id = ? AND admin_id = ?`,
        [slotPubId, adminId]
    );

    if (fetchSlot?.rows.length === 0) {
        redirect("/edit-slot");
    }

    const startTimeFromUser = getMinutes(
        formData.get("startHr"),
        formData.get("startMin"),
        formData.get("startMeridiem")
    );

    const endTimeFromUser = getMinutes(
        formData.get("endHr"),
        formData.get("endMin"),
        formData.get("endMeridiem")
    );

    const breakStartFromUser = getMinutes(
        formData.get("breakStartHr"),
        formData.get("breakStartMin"),
        formData.get("breakStartMeridiem")
    );

    const breakEndFromUser = getMinutes(
        formData.get("breakEndHr"),
        formData.get("breakEndMin"),
        formData.get("breakEndMeridiem")
    );

    const bufferTimeFromUser = formData.get("buffer");
    const statusFromUser = formData.get("status");

    if (
        startTimeFromUser === null ||
        endTimeFromUser === null ||
        breakStartFromUser === null ||
        breakEndFromUser === null ||
        !bufferTimeFromUser ||
        !statusFromUser
    ) {
        redirect("/edit-template");
    }

    const {
        id,
        status,
        start_time,
        end_time,
        break_start,
        break_end,
        buffer_minutes,
    } = fetchSlot.rows[0];

    if (
        status === statusFromUser &&
        start_time === startTimeFromUser &&
        end_time === endTimeFromUser &&
        break_start === breakStartFromUser &&
        break_end === breakEndFromUser &&
        buffer_minutes === Number(bufferTimeFromUser)
    ) {
        redirect(`/edit-slot/${slotPubId}`);
    }

    try {
        await db.execute(
            `UPDATE slots 
             SET status = ?, start_time = ?, end_time = ?, break_start = ?, break_end = ?, buffer_minutes = ? 
             WHERE id = ?`,
            [
                statusFromUser,
                startTimeFromUser,
                endTimeFromUser,
                breakStartFromUser,
                breakEndFromUser,
                Number(bufferTimeFromUser),
                id,
            ]
        );

        const dateIso = fetchSlot.rows[0].full_date_at_period.split("T")[0];

        const getAndUpdateBookings = await db.execute(
            `UPDATE bookings 
             SET status = 'revoked' 
             WHERE admin_id = ? 
             AND booking_date_iso = ? 
             AND status != 'revoked'
             RETURNING patient_email, patient_name, doctor_name`,
            [adminId, dateIso]
        );

        if (getAndUpdateBookings.rows.length > 0) {
            await sendCancellationEmails(getAndUpdateBookings.rows, 100);
        }
    } catch (e) {
        console.error("Update failed:", e);
        throw new Error("Could not update slot");
    }

    revalidatePath(`/edit-slot/${slotPubId}`);
    redirect(`/edit-slot/${slotPubId}`);
}