import { db } from "../lib/turso";
import ClientAppointments from "./Client";

export default async function Appointments() {

    const d = new Date();
    const currentDate = d.getDate();
    const currentMonthNumber = d.getMonth();
    const currentYear = d.getFullYear();

    const fetchDocsWithBookings = await db.execute(`
        SELECT d.public_id AS doctor_public_id, d.department, d.name, d.title, d.created_at AS doctor_created_at, b.public_id AS booking_public_id, b.doctor_name, b.patient_name, b.patient_email, b.patient_phone, b.treatment_type, b.treatment_start, b.treatment_end, b.date, b.month_name, b.month_number, b.year, b.day_name, b.day_number, b.booking_registered_at, b.status
        FROM doctors d
        INNER JOIN bookings b ON b.doctor_id = d.id WHERE b.date >= ? AND b.month_number = ? AND b.year = ? AND b.status = 'verified'
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


    console.log("docArrSafe", docArrSafe);
    console.log("dateKeys", dateKeys);
    //console.log("docPublicIds", docPublicIds);

    return <ClientAppointments dateKeysFromParent={dateKeys} docArrFromParent={docArrSafe} />;
}