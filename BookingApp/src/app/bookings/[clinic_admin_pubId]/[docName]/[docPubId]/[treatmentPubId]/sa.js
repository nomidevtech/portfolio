"use server";

import { redisIpLimit } from "@/app/lib/redis";
import { db } from "@/app/lib/turso";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

export async function reserveSlot(_, formData) {
    const redisLimit = await redisIpLimit(15, "reserveSlot", 60 * 15);
    if (!redisLimit.ok) return { ok: false, message: redisLimit.message };

    const adminPubId = formData.get("adminPubId");
    const fetchAdmin = await db.execute(`SELECT * FROM admins WHERE public_id = ?`, [adminPubId]);
    if (fetchAdmin.rows.length === 0) return { ok: false, message: "Invalid admin." };

    const adminId = fetchAdmin.rows[0].id;

    const docPubId = formData.get("docPubId");
    const treatmentPubId = formData.get("treatmentPubId");
    const patient_selected_treatment_start = Number(formData.get("treatment_start"));
    const patient_selected_treatment_end = Number(formData.get("treatment_end"));
    const day_number = Number(formData.get("day_number"));
    const date_number = Number(formData.get("date_number"));
    const month_number = Number(formData.get("month_number"));
    const year = Number(formData.get("year"));

    let bookingPublicId = null;

    try {
        if (
            !docPubId || !treatmentPubId ||
            !formData.get("treatment_start") || Number.isNaN(patient_selected_treatment_start) ||
            !formData.get("treatment_end") || Number.isNaN(patient_selected_treatment_end) ||
            !formData.get("day_number") || Number.isNaN(day_number) ||
            !formData.get("date_number") || Number.isNaN(date_number) ||
            !formData.get("month_number") || Number.isNaN(month_number) ||
            !formData.get("year") || Number.isNaN(year)
        ) {
            return { ok: false, message: "Missing or invalid required fields" };
        }

        const [fetchDoctor, fetchTreatment] = await Promise.all([
            db.execute(`SELECT * FROM doctors where admin_id = ? AND public_id = ?`, [adminId, docPubId]),
            db.execute(`SELECT * FROM treatments where admin_id = ? AND public_id = ?`, [adminId, treatmentPubId]),
        ]);

        if (fetchDoctor.rows.length === 0) return { ok: false, message: "Invalid doctor." };
        if (fetchTreatment.rows.length === 0) return { ok: false, message: "Invalid treatment." };

        const docId = fetchDoctor.rows[0].id;


        const fetchSlot = await db.execute(
            `SELECT status, buffer_minutes, start_time, end_time, break_start, break_end 
             FROM slots 
             WHERE admin_id = ? AND doctor_id = ? AND date_number = ? AND month_number = ? AND year = ?`,
            [adminId, docId, date_number, month_number, year]
        );

        if (fetchSlot.rows.length === 0 || fetchSlot.rows[0].status !== 'active') {
            return { ok: false, message: "This slot is no longer available." };
        }

        const { buffer_minutes, start_time, end_time, break_start, break_end } = fetchSlot.rows[0];
        const docName = fetchDoctor.rows[0].name;
        const treatmentId = fetchTreatment.rows[0].id;
        const treatmentDuration = fetchTreatment.rows[0].duration;

        const validTreatmentDuration = patient_selected_treatment_end - patient_selected_treatment_start === treatmentDuration;
        if (!validTreatmentDuration) return { ok: false, message: "Invalid treatment duration." };

        if (patient_selected_treatment_start < start_time || patient_selected_treatment_end > end_time) {
            return { ok: false, message: "Selected time is outside of clinic hours." };
        }
        if (patient_selected_treatment_start < break_end && patient_selected_treatment_end > break_start) {
            return { ok: false, message: "Selected time overlaps with the doctor's break." };
        }

        const fetchRecord = await db.execute(
            `SELECT 1 FROM doctor_treatments WHERE doctor_id = ? AND treatment_id = ? AND admin_id = ?`,
            [docId, treatmentId, adminId]
        );
        if (fetchRecord.rows.length === 0) return { ok: false, message: "Invalid treatment." };

        const bookingDate = `${year}-${String(month_number + 1).padStart(2, '0')}-${String(date_number).padStart(2, '0')}`;

        // Atomic INSERT with built-in overlap check
        const res = await db.execute(
            `INSERT INTO bookings (admin_id, public_id, doctor_name, doctor_id, treatment_id, day_number, date_number, month_number, year, booking_date_iso, treatment_start, treatment_end)
             SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
             WHERE NOT EXISTS (
                 SELECT 1 FROM bookings
                 WHERE admin_id = ? AND doctor_id = ? AND date_number = ? AND month_number = ? AND year = ?
                 AND treatment_start < ? 
                 AND (treatment_end + ?) > ? 
                 AND status NOT IN('cancelled', 'revoked')
             ) RETURNING public_id`,
            [
                adminId, nanoid(12), docName, docId, treatmentId, day_number, date_number, month_number, year, bookingDate, patient_selected_treatment_start, patient_selected_treatment_end,
                // WHERE NOT EXISTS overlap check values
                adminId, docId, date_number, month_number, year,
                patient_selected_treatment_end + buffer_minutes,
                buffer_minutes, patient_selected_treatment_start
            ]
        );

        if (res.rows.length === 0) {
            return { ok: false, message: "This slot was just taken by someone else. Please select another." };
        }

        bookingPublicId = res.rows[0].public_id;

    } catch (error) {
        console.error("Booking Error:", error);
        return { ok: false, message: "An unexpected error occurred. Please try again." };
    }

    redirect(`/appointment-registration/${bookingPublicId}/${adminPubId}`);
}