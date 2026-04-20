'use server'

import { db } from "../lib/turso";

export async function cancelBookingServerAction(prevState, formData) {
    const booking_public_id = formData.get("booking_public_id");
    try {
        await db.execute({ sql: `UPDATE bookings SET status = 'cancelled' WHERE public_id = ?`, args: [booking_public_id] });
        return { ok: true, message: "Booking cancelled." };
    } catch (e) {
        return { ok: false, message: "Failed to cancel booking." };
    }
}

export async function cancelManyBookingsServerAction(prevState, formData) {
    const booking_ids = JSON.parse(formData.get("booking_ids"));
    try {
        await Promise.all(
            booking_ids.map(id => db.execute({ sql: `UPDATE bookings SET status = 'cancelled' WHERE public_id = ?`, args: [id] }))
        );
        return { ok: true, message: "All bookings cancelled." };
    } catch (e) {
        return { ok: false, message: "Failed to cancel bookings." };
    }
}
export async function fetchAllBookings(dateObj = new Date(), searchValue = "") {

    try {
        const d = dateObj;
        const currentDate = d.getDate();
        const currentMonthNumber = d.getMonth();
        const currentYear = d.getFullYear();
        let seachString = null;
        if (searchValue === "all") seachString = ` AND b.status = 'verified' OR b.status = 'pending'`;
        if (searchValue === "cancelled") seachString = ` AND b.status = 'cancelled'`;
        if (searchValue !== "all" || searchValue !== "cancelled") seachString = ` AND b.status = 'verified' OR b.status = 'pending'`;

        const fetchDocsWithBookings = await db.execute(`
        SELECT d.public_id AS doctor_public_id, d.department, d.name, d.title, d.created_at AS doctor_created_at, b.public_id AS booking_public_id, b.doctor_name, b.patient_name, b.patient_email, b.patient_phone, b.treatment_type, b.treatment_start, b.treatment_end, b.date, b.month_name, b.month_number, b.year, b.day_name, b.day_number, b.booking_registered_at, b.status
        FROM doctors d
        INNER JOIN bookings b ON b.doctor_id = d.id WHERE b.date >= ? AND b.month_number = ? AND b.year = ? ${seachString}
        ORDER BY b.year ASC, b.month_number ASC, b.date ASC, b.treatment_start ASC 
    `, [currentDate, currentMonthNumber, currentYear]);

        const rows = fetchDocsWithBookings?.rows || [];

        const docArrSafe = rows.map(fn => ({
            doctor_public_id: fn.doctor_public_id,
            booking_public_id: fn.booking_public_id,
            department: fn.department,
            name: fn.name,
            title: fn.title,
            doctor_created_at: fn.doctor_created_at,
            doctor_name: fn.doctor_name,
            patient_name: fn.patient_name,
            patient_email: fn.patient_email,
            patient_phone: fn.patient_phone,
            treatment_type: fn.treatment_type,
            treatment_start: fn.treatment_start,
            treatment_end: fn.treatment_end,
            date: fn.date,
            month_name: fn.month_name,
            month_number: fn.month_number,
            year: fn.year,
            day_name: fn.day_name,
            day_number: fn.day_number,
            booking_registered_at: fn.booking_registered_at,
            status: fn.status,
            dateKey: `${fn.year}-${fn.month_number}-${fn.date}`
        }));

        const dateKeys = [...new Set(docArrSafe.map(r => r.dateKey))];

        return { dateKeys, docArrSafe }


    } catch (e) {
        console.log(e);
        return { ok: false, message: "Failed to fetch bookings." };
    }
}