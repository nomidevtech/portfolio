"use server";

import { db } from "@/app/lib/turso";
import { redirect } from "next/navigation";
import getMinutes from "@/app/utils/getMinutes";
import { revalidatePath } from "next/cache";
import { getUserPlus } from "@/app/lib/getUser";
import { sendCancelationEmails } from "@/app/lib/sendCancelationEmail";

export async function editSlotServerAction(formData) {
    const currentUser = await getUserPlus();

    if (!currentUser || currentUser.role !== "admin" || !currentUser.admin_id) {
        redirect("/login");
    }

    const adminId = currentUser.admin_id;
    const slotPubId = formData.get("slotPubId");

    if (!slotPubId) {
        redirect("/manage-generated-slots");
    }

    const fetchSlot = await db.execute(
        `SELECT * FROM slots WHERE public_id = ? AND admin_id = ?`,
        [slotPubId, adminId]
    );

    if (fetchSlot?.rows.length === 0) {
        redirect("/manage-generated-slots");
    }

    const currentSlot = fetchSlot.rows[0];

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

    if (startTimeFromUser >= endTimeFromUser)
        return { ok: false, message: "Start time must be before end time" };

    if (breakStartFromUser <= startTimeFromUser || breakStartFromUser >= breakEndFromUser) return { ok: false, message: "Break start must be between start and end" };

    if (breakEndFromUser >= endTimeFromUser) return { ok: false, message: "Break end must be before clinic end" };
    if (Number(formData.get("buffer")) < 0) return { ok: false, message: "Buffer cannot be negative" };


    const bufferTimeFromUser = Number(formData.get("buffer"));
    const statusFromUser = formData.get("status");

    const dateIso = currentSlot.full_date_at_period.split(/[ T]/)[0];

    const hasChanged =
        currentSlot.status !== statusFromUser ||
        currentSlot.start_time !== startTimeFromUser ||
        currentSlot.end_time !== endTimeFromUser ||
        currentSlot.break_start !== breakStartFromUser ||
        currentSlot.break_end !== breakEndFromUser ||
        currentSlot.buffer_minutes !== bufferTimeFromUser;

    if (!hasChanged) {
        redirect(`/edit-slot/${slotPubId}`);
    }

    let affectedBookings = [];

    try {
        const batchResults = await db.batch(
            [
                {
                    sql: `UPDATE slots 
                          SET status = ?, start_time = ?, end_time = ?, break_start = ?, break_end = ?, buffer_minutes = ? 
                          WHERE id = ?`,
                    args: [
                        statusFromUser,
                        startTimeFromUser,
                        endTimeFromUser,
                        breakStartFromUser,
                        breakEndFromUser,
                        bufferTimeFromUser,
                        currentSlot.id,
                    ],
                },
                {
                    sql: `UPDATE bookings 
                          SET status = 'revoked' 
                          WHERE admin_id = ? 
                          AND doctor_id = ? 
                          AND booking_date_iso = ?
                          AND status IN ('pending','unverified','verified')
                          RETURNING patient_email, patient_name, doctor_name`,
                    args: [adminId, currentSlot.doctor_id, dateIso],
                },
            ],
            "write"
        );

        affectedBookings = batchResults[1].rows;

        if (affectedBookings.length > 0) {
            try {
                const emailableRows = affectedBookings.filter(r => r.patient_email);
                if (emailableRows.length > 0) await sendCancelationEmails(emailableRows, 100);
            } catch (emailErr) {
                console.error(
                    "Critical: Schedule updated but emails failed:",
                    emailErr
                );
            }
        }
    } catch (e) {
        console.error("Batch update failed:", e);
        return null;
    }

    revalidatePath(`/edit-slot/${slotPubId}`);
    revalidatePath("/manage-generated-slots");

    redirect(`/edit-slot/${slotPubId}?success=true`);
}