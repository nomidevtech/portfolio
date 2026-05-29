import { PatientEmailVerification } from "@/app/components/emailVerification";
import { db } from "@/app/lib/turso";
import { capitalizeLabel, fromHyphenSlug } from "@/app/utils/displaySlug";
import { getMonthName } from "@/app/utils/getDateData";
import { minutesToMeridiem } from "@/app/utils/minutes-to-meridiem";
import DownloadTicketButton from "./client";
import { redisIpLimit } from "@/app/lib/redis";
import ResendCancelBookingEmail from "@/app/components/cancel-book-email/PatientResendCancelBookingEmail";

export const metadata = {
    title: "Booking Status",
    description: "View appointment booking status and ticket actions.",
};

export default async function Message({ params }) {
    const redisLimit = await redisIpLimit(20, "message", 60 * 15);
    if (!redisLimit.ok) return <main className="page-shell"><p className="status-error">{redisLimit.message}</p></main>

    const { bookingPubId, adminPubId } = await params;
    if (!bookingPubId || !adminPubId) return <main className="page-shell"><p className="status-error">Broken link. Booking not found.</p></main>;

    const fetchAdmin = await db.execute(`SELECT id FROM admins WHERE public_id = ?`, [adminPubId]);
    if (fetchAdmin.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Booking not found.</p></main>;

    const adminId = fetchAdmin.rows[0].id;
    const fetch = await db.execute(`SELECT * FROM bookings WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);
    if (fetch.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Booking not found.</p></main>;

    const booking = fetch.rows[0];
    if (booking.status === "cancelled") return <main className="page-shell"><p className="status-warning">You have cancelled this booking. Please book again.</p></main>;
    if (booking.status === "revoked") return <main className="page-shell"><p className="status-warning">Appointment has been revoked by the clinic. Please book again.</p></main>;

    return (
        <main className="page-shell-narrow">
            <div className="mb-8">
                <p className="soft-pill">Booking status</p>
                <h1 className="mt-4 text-3xl font-black text-slate-950">Appointment details</h1>
                <p className="mt-2 text-slate-600">Check verification status and download your ticket when confirmed.</p>
            </div>

            <section className="section-panel">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <Info label="Date" value={`${booking.date_number > 9 ? booking.date_number : "0" + booking.date_number} ${getMonthName(booking.month_number)} ${booking.year}`} />
                    <Info label="Timing" value={`${minutesToMeridiem(booking.treatment_start, true)} - ${minutesToMeridiem(booking.treatment_end, true)}`} />
                    <Info label="Patient" value={fromHyphenSlug(booking.patient_name)} />
                    <Info label="Email" value={booking.patient_email} />
                    <Info label="Phone" value={booking.patient_phone} />
                    <Info label="Status" value={capitalizeLabel(booking.status)} />
                </dl>
            </section>

            <section className="mt-6 grid gap-4">
                {booking.status !== "verified" && (
                    <div className="section-panel">
                        <p className="status-warning">You need to verify your email within 30 minutes to keep this slot reserved.</p>
                        <PatientEmailVerification bookingPubId={bookingPubId} adminPubId={adminPubId} />
                    </div>
                )}
                {booking.status === "verified" && (
                    <div className="section-panel">
                        <p className="status-success">Slot booked successfully.</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <DownloadTicketButton bookingPubId={bookingPubId} adminPubId={adminPubId} />
                        </div>
                    </div>
                )}
                {booking.status === "verified" && <ResendCancelBookingEmail bookingPubId={bookingPubId} adminPubId={adminPubId} />}
            </section>
        </main>
    );
}

function Info({ label, value }) {
    return <div className="rounded-2xl bg-emerald-50 p-4"><dt className="font-bold text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-950">{value || "N/A"}</dd></div>;
}
