/* eslint-disable react-hooks/error-boundaries, react-hooks/purity */
import { redisIpLimit } from "@/app/lib/redis";
import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import Link from "next/link";

export const metadata = {
    title: "Cancel Appointment",
    description: "Cancel a verified appointment booking.",
};

export default async function CancelAppointment({ params }) {
    try {

        const redisLimit = await redisIpLimit(15, "cancel_booking", 60 * 15);
        if (!redisLimit.ok) return <main className="page-shell"><p className="status-error">{redisLimit.message}</p></main>

        const { cancelToken, bookingPubId, adminPubId } = await params;

        if (!cancelToken || !bookingPubId || !adminPubId) return <main className="page-shell"><p className="status-error">Broken link. Email not found.</p></main>;

        const fetchAdmin = await db.execute(`SELECT id FROM admins WHERE public_id = ?`, [adminPubId]);
        if (fetchAdmin.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Email not found.</p></main>;

        const adminId = fetchAdmin.rows[0].id;


        const fetchBooking = await db.execute(`SELECT id, cancel_token_hash, cancel_token_created_at FROM bookings WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);
        if (fetchBooking.rows.length === 0) return <main className="page-shell"><p className="status-error">Broken link. Email not found.</p></main>;

        if (!fetchBooking.rows[0].cancel_token_hash) {
            redirect(`/message/${bookingPubId}/${adminPubId}`);
        }

        const tokenAge = Date.now() - new Date(fetchBooking.rows[0].cancel_token_created_at).getTime();
        if (isNaN(tokenAge) || tokenAge > 1000 * 60 * 60 * 24 * 7)
            return <main className="page-shell"><p className="status-warning">This cancel link has expired. Request a new one <Link href={`/message/${bookingPubId}/${adminPubId}`} className="font-bold underline">here</Link>.</p></main>;


        const verified = await compare(cancelToken, fetchBooking.rows[0].cancel_token_hash);
        if (!verified) return <main className="page-shell"><p className="status-error">Broken link. Email not found.</p></main>;

        const updateBooking = await db.execute(`UPDATE bookings SET cancel_token_hash = NULL, status = 'cancelled' WHERE admin_id = ? AND public_id = ? AND status = 'verified'`, [adminId, bookingPubId]);

        if (updateBooking.rowsAffected === 0) return <main className="page-shell"><p className="status-error">Something went wrong. Please try again.</p></main>;


        redirect(`/message/${bookingPubId}/${adminPubId}`);
    } catch (error) {
        if (isRedirectError(error)) throw error;  // let redirects through
        return <main className="page-shell"><p className="status-error">Something went wrong. Please try again.</p></main>;
    }
}
