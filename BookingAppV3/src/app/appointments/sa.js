"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { getUser } from "../lib/getUser";
import { sendCancelationEmails } from "../lib/sendCancelationEmail";
import { sendEmail } from "../lib/resend";
import { fromHyphenSlug } from "@/app/utils/displaySlug";


export async function adminRevokeBookings(_, formData) {
    try {
        const bookingsDate = formData.get("bookingsDate");
        const adminPubId = formData.get("adminPubId");

        if (!bookingsDate || !adminPubId) {
            return { ok: false, message: "Missing required fields." };
        }

        const user = await getUser();
        if (!user) return { ok: false, message: "Unauthorized." };
        if (user.role !== "admin") return { ok: false, message: "Forbidden." };

        const fetchAdmin = await db.execute(
            "SELECT id FROM admins WHERE public_id = ?",
            [adminPubId]
        );
        if (fetchAdmin.rows.length === 0) return { ok: false, message: "Admin not found." };

        const admin = fetchAdmin.rows[0];
        if (admin.id !== user.admin_id) return { ok: false, message: "Forbidden." };


        const getAndUpdateBookings = await db.execute(
            `UPDATE bookings SET status = 'revoked' WHERE admin_id = ? AND booking_date_iso = ? AND status NOT IN ('revoked', 'cancelled') RETURNING patient_email, patient_name, doctor_name`, [admin.id, bookingsDate]);

        const rowsWithEmail = getAndUpdateBookings.rows.filter(row => row.patient_email);
        if (rowsWithEmail.length > 0) {
            await sendCancelationEmails(rowsWithEmail, 100);
        }


    } catch (error) {
        console.error("adminRevokeBookings error:", error);
        return { ok: false, message: "Something went wrong." };
    }

    redirect("/appointments");
}


export async function adminRevokeBooking(_, formData) {
    try {
        const bookingPubId = formData.get("bookingPubId");
        const adminPubId = formData.get("adminPubId");

        if (!bookingPubId || !adminPubId) {
            return { ok: false, message: "Missing required fields." };
        }

        const user = await getUser();
        if (!user) return { ok: false, message: "Unauthorized." };
        if (user.role !== "admin") return { ok: false, message: "Forbidden." };

        const fetchAdmin = await db.execute(
            "SELECT id FROM admins WHERE public_id = ?",
            [adminPubId]
        );
        if (fetchAdmin.rows.length === 0) return { ok: false, message: "Admin not found." };

        const admin = fetchAdmin.rows[0];
        if (admin.id !== user.admin_id) return { ok: false, message: "Forbidden." };

        const updateResult = await db.execute(
            `UPDATE bookings SET status = 'revoked' 
             WHERE public_id = ? AND admin_id = ? AND status NOT IN ('revoked', 'cancelled')
             RETURNING patient_email, patient_name, doctor_name, status`,
            [bookingPubId, admin.id]
        );
        if (updateResult.rows.length === 0) {
            return { ok: false, message: "Booking not found, already revoked, or access denied." };
        }
        const booking = updateResult.rows[0];
        const to = booking?.patient_email;
        const name = fromHyphenSlug(booking?.patient_name, "Visitor");
        const subject = "Your booking has been revoked.";
        const html = `
                <p>Dear ${name}</p>
                <p>This is to inform you that your scheduled appointment with Dr. ${fromHyphenSlug(booking.doctor_name)} has been cancelled by the clinic.</p>
                <p>Please Visit our website to schedule another appointment.</p>
                `;

        if (to) await sendEmail({ to, subject, html });

    } catch (error) {
        console.error("adminRevokeBooking error:", error);
        return { ok: false, message: "Something went wrong." };
    }

    redirect("/appointments");
}


export async function doctorRevokeBookings(_, formData) {
    try {
        const bookingsDate = formData.get("bookingsDate");
        const doctorPubId = formData.get("doctorPubId");

        if (!bookingsDate || !doctorPubId) {
            return { ok: false, message: "Missing required fields." };
        }

        const user = await getUser();
        if (!user) return { ok: false, message: "Unauthorized." };
        if (user.role !== "doctor") return { ok: false, message: "Forbidden." };

        const fetchDoctor = await db.execute(
            "SELECT id FROM doctors WHERE public_id = ?",
            [doctorPubId]
        );
        if (fetchDoctor.rows.length === 0) return { ok: false, message: "Doctor not found." };

        const doctor = fetchDoctor.rows[0];
        if (doctor.id !== user.doctor_id) return { ok: false, message: "Forbidden." };

        const res = await db.execute(
            `UPDATE bookings SET status = 'revoked' WHERE doctor_id = ? AND booking_date_iso = ? AND status NOT IN ('revoked', 'cancelled') RETURNING patient_email, patient_name, doctor_name`,
            [doctor.id, bookingsDate]
        );

        const rowsWithEmail = res.rows.filter(row => row.patient_email);
        if (rowsWithEmail.length > 0) {
            await sendCancelationEmails(rowsWithEmail, 100);
        }

    } catch (error) {
        console.error("doctorRevokeBookings error:", error);
        return { ok: false, message: "Something went wrong." };
    }

    redirect("/appointments");
}


export async function doctorRevokeBooking(_, formData) {
    try {
        const bookingPubId = formData.get("bookingPubId");
        const doctorPubId = formData.get("doctorPubId");

        if (!bookingPubId || !doctorPubId) {
            return { ok: false, message: "Missing required fields." };
        }

        const user = await getUser();
        if (!user) return { ok: false, message: "Unauthorized." };
        if (user.role !== "doctor") return { ok: false, message: "Forbidden." };

        const fetchDoctor = await db.execute(
            "SELECT id FROM doctors WHERE public_id = ?",
            [doctorPubId]
        );
        if (fetchDoctor.rows.length === 0) return { ok: false, message: "Doctor not found." };

        const doctor = fetchDoctor.rows[0];
        if (doctor.id !== user.doctor_id) return { ok: false, message: "Forbidden." };

        const updateResult = await db.execute(
            `UPDATE bookings SET status = 'revoked' 
             WHERE public_id = ? AND doctor_id = ? AND status NOT IN ('revoked', 'cancelled')
             RETURNING patient_email, patient_name, doctor_name`,
            [bookingPubId, doctor.id]
        );
        if (updateResult.rows.length === 0) {
            return { ok: false, message: "Booking not found, already revoked, or access denied." };
        }
        const booking = updateResult.rows[0];
        const patientName = fromHyphenSlug(booking?.patient_name, "Visitor");
        const doctorName = booking.doctor_name
            ? `Dr. ${fromHyphenSlug(booking.doctor_name)}`
            : "the doctor";
        const to = booking.patient_email;
        const subject = "Your booking has been revoked.";
        const html = `
                <p>Dear ${patientName}</p>
                <p>This is to inform you that your scheduled appointment with ${doctorName} has been cancelled by the clinic.</p>
                <p>Please Visit our website to schedule another appointment.</p>
                `;

        if (to) await sendEmail({ to, subject, html });

    } catch (error) {
        console.error("doctorRevokeBooking error:", error);
        return { ok: false, message: "Something went wrong." };
    }

    redirect("/appointments");
}