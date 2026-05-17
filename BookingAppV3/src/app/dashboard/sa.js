"use server";

import { db } from "@/app/lib/turso";
import { getUserPlus } from "@/app/lib/getUser";

export async function getDashboardStats() {
    const currentUser = await getUserPlus();
    if (!currentUser) return { ok: false, message: "Unauthorized" };

    try {
        if (currentUser.role === "admin") {
            const adminId = currentUser.admin_id;

            // Fetch admin-level stats
            const [doctorsRes, bookingsRes, slotsRes] = await Promise.all([
                db.execute("SELECT COUNT(*) as total FROM doctors WHERE admin_id = ?", [adminId]),
                db.execute("SELECT status, COUNT(*) as count FROM bookings WHERE admin_id = ? GROUP BY status", [adminId]),
                db.execute("SELECT COUNT(*) as total FROM slots WHERE admin_id = ? AND status = 'active' AND full_date_at_period >= DATE('now')", [adminId])
            ]);

            const bookingsCount = { verified: 0, pending: 0, cancelled: 0, revoked: 0, unverified: 0 };
            let totalBookings = 0;
            bookingsRes.rows.forEach(row => {
                bookingsCount[row.status] = row.count;
                totalBookings += row.count;
            });

            return {
                ok: true,
                role: "admin",
                data: {
                    totalDoctors: doctorsRes.rows[0].total,
                    totalBookings,
                    bookingsCount,
                    activeUpcomingSlots: slotsRes.rows[0].total
                }
            };
        } else if (currentUser.role === "doctor") {
            const doctorId = currentUser.doctor_id;

            // Fetch doctor-level stats (restricted to their doctor_id)
            const [bookingsRes, slotsRes] = await Promise.all([
                db.execute("SELECT status, COUNT(*) as count FROM bookings WHERE doctor_id = ? GROUP BY status", [doctorId]),
                db.execute("SELECT COUNT(*) as total FROM slots WHERE doctor_id = ? AND status = 'active' AND full_date_at_period >= DATE('now')", [doctorId])
            ]);

            const bookingsCount = { verified: 0, pending: 0, cancelled: 0, revoked: 0, unverified: 0 };
            let totalBookings = 0;
            bookingsRes.rows.forEach(row => {
                bookingsCount[row.status] = row.count;
                totalBookings += row.count;
            });

            return {
                ok: true,
                role: "doctor",
                data: {
                    totalBookings,
                    bookingsCount,
                    activeUpcomingSlots: slotsRes.rows[0].total
                }
            };
        }

        return { ok: false, message: "Invalid role" };
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return { ok: false, message: "Failed to load stats" };
    }
}