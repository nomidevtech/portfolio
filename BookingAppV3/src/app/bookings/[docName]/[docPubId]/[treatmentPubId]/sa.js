"use server";

import { db } from "@/app/lib/turso";
import { initBookingsTable } from "@/app/Models/initTables";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";


export async function reserveSlot(_, formData) {


    const adminId = 1;

    const docPubId = formData.get("docPubId");
    const treatmentPubId = formData.get("treatmentPubId");
    const treatment_start = Number(formData.get("treatment_start"));
    const treatment_end = Number(formData.get("treatment_end"));
    const day_number = Number(formData.get("day_number"));
    const date_number = Number(formData.get("date_number"));
    const month_number = Number(formData.get("month_number"));
    const year = Number(formData.get("year"));


    let bookingPublicId = null;

    try {

        if (!docPubId || !date_number || !month_number || !year || !treatmentPubId || !treatment_start || !treatment_end) throw new Error("Missing required fields.");


        const [fetchDoctor, fetchTreatment] = await Promise.all([
            db.execute(`SELECT * FROM doctors where admin_id = ? AND public_id = ?`, [adminId, docPubId]),
            db.execute(`SELECT * FROM treatments where admin_id = ? AND public_id = ?`, [adminId, treatmentPubId]),
        ]);

        if (fetchDoctor.rows.length === 0) throw new Error("Invalid doctor.");
        if (fetchTreatment.rows.length === 0) throw new Error("Invalid treatment.");

        const docId = fetchDoctor?.rows[0]?.id;
        const docName = fetchDoctor?.rows[0]?.name;
        const treatmentId = fetchTreatment?.rows[0]?.id;
        const treatmentDuration = fetchTreatment?.rows[0]?.duration;

        const validTreatmentDuration = treatment_end - treatment_start === treatmentDuration;
        if (!validTreatmentDuration) throw new Error("Invalid treatment duration.");

        const [fetchRecord, fetchBookings] = await Promise.all([
            db.execute(`SELECT * FROM doctor_treatments WHERE doctor_id = ? AND treatment_id = ? AND admin_id = ?`, [docId, treatmentId, adminId]),
            db.execute(`SELECT * FROM bookings WHERE admin_id = ? AND doctor_id = ? AND treatment_id = ? AND date_number = ? AND month_number = ? AND year = ?`, [adminId, docId, treatmentId, date_number, month_number, year])
        ]);

        if (fetchRecord.rows.length === 0) throw new Error("Invalid doctor-treatment combination.");

        if (fetchBookings.rows.length > 0) {
            for (const booking of fetchBookings.rows) {
                if (treatment_end > booking.start && treatment_start < booking.end) {
                    throw new Error("Slot already reserved by someone.");
                }
            }
        };

        const res = await db.execute(`INSERT INTO bookings (admin_id, public_id, doctor_name, doctor_id, treatment_id, day_number, date_number, month_number, year, treatment_start, treatment_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING public_id `, [adminId, nanoid(12), docName, docId, treatmentId, day_number, date_number, month_number, year, treatment_start, treatment_end]);

        if (res.rows.length === 0) throw new Error("Slot already reserved by someone.");

        bookingPublicId = res.rows[0].public_id;




    } catch (error) {
        console.error(error);
        return { ok: false, message: error.message };
    }

    redirect(`/appointment-registeration/${bookingPublicId}`);

}

