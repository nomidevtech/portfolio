"use server";

import { redirect } from "next/navigation";
import { db } from "../lib/turso";
import { getUser } from "../lib/getUser";


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
            "SELECT * FROM admins WHERE public_id = ?",
            [adminPubId]
        );
        if (fetchAdmin.rows.length === 0) return { ok: false, message: "Admin not found." };

        const admin = fetchAdmin.rows[0];
        if (admin.id !== user.admin_id) return { ok: false, message: "Forbidden." };

        await db.execute(
            `UPDATE bookings SET status = 'revoked' WHERE admin_id = ? AND booking_date_iso = ? AND status != 'revoked'`,
            [admin.id, bookingsDate]
        );

    } catch (error) {
        console.error("adminRevokeBookings error:", error);
        return { ok: false, message: "Something went wrong." };
    }

    redirect("/dashboard");
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
            "SELECT * FROM admins WHERE public_id = ?",
            [adminPubId]
        );
        if (fetchAdmin.rows.length === 0) return { ok: false, message: "Admin not found." };

        const admin = fetchAdmin.rows[0];
        if (admin.id !== user.admin_id) return { ok: false, message: "Forbidden." };

        const fetchBooking = await db.execute(
            "SELECT * FROM bookings WHERE public_id = ? AND admin_id = ?",
            [bookingPubId, admin.id]
        );
        if (fetchBooking.rows.length === 0) {
            return { ok: false, message: "Booking not found or access denied." };
        }
        if (fetchBooking.rows[0].status === "revoked") {
            return { ok: false, message: "Booking is already revoked." };
        }

        await db.execute(
            "UPDATE bookings SET status = 'revoked' WHERE public_id = ? AND admin_id = ?",
            [bookingPubId, admin.id]
        );

    } catch (error) {
        console.error("adminRevokeBooking error:", error);
        return { ok: false, message: "Something went wrong." };
    }

    redirect("/dashboard");
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
            "SELECT * FROM doctors WHERE public_id = ?",
            [doctorPubId]
        );
        if (fetchDoctor.rows.length === 0) return { ok: false, message: "Doctor not found." };

        const doctor = fetchDoctor.rows[0];
        if (doctor.id !== user.doctor_id) return { ok: false, message: "Forbidden." };

        await db.execute(
            `UPDATE bookings SET status = 'revoked' WHERE doctor_id = ? AND booking_date_iso = ? AND status != 'revoked'`,
            [doctor.id, bookingsDate]
        );

    } catch (error) {
        console.error("doctorRevokeBookings error:", error);
        return { ok: false, message: "Something went wrong." };
    }

    redirect("/dashboard");
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
            "SELECT * FROM doctors WHERE public_id = ?",
            [doctorPubId]
        );
        if (fetchDoctor.rows.length === 0) return { ok: false, message: "Doctor not found." };

        const doctor = fetchDoctor.rows[0];
        if (doctor.id !== user.doctor_id) return { ok: false, message: "Forbidden." };

        const fetchBooking = await db.execute(
            "SELECT * FROM bookings WHERE public_id = ? AND doctor_id = ?",
            [bookingPubId, doctor.id]
        );
        if (fetchBooking.rows.length === 0) {
            return { ok: false, message: "Booking not found or access denied." };
        }
        if (fetchBooking.rows[0].status === "revoked") {
            return { ok: false, message: "Booking is already revoked." };
        }

        await db.execute(
            "UPDATE bookings SET status = 'revoked' WHERE public_id = ? AND doctor_id = ?",
            [bookingPubId, doctor.id]
        );

    } catch (error) {
        console.error("doctorRevokeBooking error:", error);
        return { ok: false, message: "Something went wrong." };
    }

    redirect("/dashboard");
}