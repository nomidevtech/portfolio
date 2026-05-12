"use server";

import { db } from "@/app/lib/turso";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";


export async function reserveSlot(_, formData) {

    const adminPubId = formData.get("adminPubId");
    const fetchAdmin = await db.execute(`SELECT * FROM admins WHERE public_id = ?`, [adminPubId]);
    if (fetchAdmin.rows.length === 0) return { ok: false, message: "Invalid admin." }

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

        if (!docPubId || !date_number || typeof month_number !== "number" || !year || !treatmentPubId || !patient_selected_treatment_start || !patient_selected_treatment_end) return { ok: false, message: "Missing required fields" };

        const fetchSlot = await db.execute(
            `SELECT status FROM slots WHERE admin_id = ? AND doctor_id = ? AND date_number = ? AND month_number = ? AND year = ?`,
            [adminId, docId, date_number, month_number, year]
        );
        if (fetchSlot.rows.length === 0 || fetchSlot.rows[0].status !== 'active')
            return { ok: false, message: "This slot is no longer available." };

        const [fetchDoctor, fetchTreatment] = await Promise.all([
            db.execute(`SELECT * FROM doctors where admin_id = ? AND public_id = ?`, [adminId, docPubId]),
            db.execute(`SELECT * FROM treatments where admin_id = ? AND public_id = ?`, [adminId, treatmentPubId]),
        ]);

        if (fetchDoctor.rows.length === 0) return { ok: false, message: "Invalid doctor." };
        if (fetchTreatment.rows.length === 0) return { ok: false, message: "Invalid treatment." };

        const docId = fetchDoctor?.rows[0]?.id;
        const docName = fetchDoctor?.rows[0]?.name;
        const treatmentId = fetchTreatment?.rows[0]?.id;
        const treatmentDuration = fetchTreatment?.rows[0]?.duration;

        const validTreatmentDuration = patient_selected_treatment_end - patient_selected_treatment_start === treatmentDuration;
        if (!validTreatmentDuration) return { ok: false, message: "Invalid treatment duration." };

        const [fetchRecord, fetchBookings] = await Promise.all([
            db.execute(
                `SELECT 1 FROM doctor_treatments WHERE doctor_id = ? AND treatment_id = ? AND admin_id = ?`,
                [docId, treatmentId, adminId]
            ),
            db.execute(
                `SELECT 1 FROM bookings
                 WHERE admin_id = ? AND doctor_id = ? AND date_number = ? AND month_number = ? AND year = ?
                 AND treatment_end > ? AND treatment_start < ? AND status NOT IN('cancelled', 'revoked')
                 LIMIT 1`,
                [adminId, docId, date_number, month_number, year, patient_selected_treatment_start, patient_selected_treatment_end]
            ),
        ]);

        if (fetchRecord.rows.length === 0) return { ok: false, message: "Invalid treatment." };
        if (fetchBookings.rows.length > 0) return { ok: false, message: "Slot already reserved by someone." };

        const bookingDate = `${year}-${String(month_number + 1).padStart(2, '0')}-${String(date_number).padStart(2, '0')}`;


        const res = await db.execute(
            `INSERT INTO bookings (admin_id, public_id, doctor_name, doctor_id, treatment_id, day_number, date_number, month_number, year, booking_date_iso, treatment_start, treatment_end)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING public_id`,
            [adminId, nanoid(12), docName, docId, treatmentId, day_number, date_number, month_number, year, bookingDate, patient_selected_treatment_start, patient_selected_treatment_end]
        );

        if (res.rows.length === 0) return { ok: false, message: "Failed to reserve slot." };

        bookingPublicId = res.rows[0].public_id;

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Failed to reserve slot." };
    }

    redirect(`/appointment-registeration/${bookingPublicId}/${adminPubId}`);
}