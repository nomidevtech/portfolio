// app/actions/generateTicketPdf.js
"use server";

import { db } from "@/app/lib/turso";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getMonthName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";

export async function generateTicketPdf(bookingPubId) {
    if (!bookingPubId) throw new Error("Missing bookingPubId");

    const adminId = 1;

    const result = await db.execute(
        `
    SELECT 
      b.*,
      d.name AS doctor_name,
      d.qualifications,
      d.department,
      t.name AS treatment_name,
      t.duration
    FROM bookings b
    LEFT JOIN doctors d ON b.doctor_id = d.id
    LEFT JOIN treatments t ON b.treatment_id = t.id
    WHERE b.public_id = ? AND b.admin_id = ?
    `,
        [bookingPubId, adminId]
    );

    if (result.rows.length === 0) throw new Error("Booking not found");

    const booking = result.rows[0];

    if (booking.status !== "verified") {
        throw new Error("Not verified");
    }

    // ---- FORMAT LAYER (server responsibility) ----

    const date = `${booking.date_number} ${getMonthName(
        booking.month_number
    )} ${booking.year}`;

    const time = `${minutesToMeridiem(
        booking.treatment_start,
        true
    )} - ${minutesToMeridiem(booking.treatment_end, true)}`;

    const patientName = booking.patient_name
        ?.split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");

    const doctorName = booking.doctor_name
        ?.split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");

    const treatmentName = booking.treatment_name?.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");


    // ---- PDF GENERATION ----

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([420, 300]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();

    let y = height - 30;

    function draw(text, size = 12) {
        page.drawText(text, {
            x: 20,
            y,
            size,
            font,
            color: rgb(0, 0, 0),
        });
        y -= size + 8;
    }

    // ---- STRUCTURED LAYOUT ----

    draw("Appointment Ticket", 16);
    draw("------------------------------");

    draw(`Patient: ${patientName}`);
    draw(`Email: ${booking.patient_email}`);
    draw(`Phone: ${booking.patient_phone}`);

    draw("------------------------------");

    draw(`Doctor: ${doctorName.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")}`);
    draw(`Department: ${booking.department || "-"}`);
    draw(`Qualifications: ${JSON.parse(booking.qualifications).map(fn => fn.toUpperCase()).join(", ") || "-"}`);

    draw("------------------------------");

    draw(`Treatment: ${treatmentName}`);
    draw(`Duration: ${booking.duration || "-"} mins`);

    draw("------------------------------");

    draw(`Date: ${date}`);
    draw(`Time: ${time}`);

    draw("------------------------------");

    draw(`Booking ID: ${booking.public_id}`, 10);

    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
}