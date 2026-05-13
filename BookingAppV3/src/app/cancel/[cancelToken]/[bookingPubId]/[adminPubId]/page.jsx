import { redisIpLimit } from "@/app/lib/redis";
import { db } from "@/app/lib/turso";
import { compare } from "@/app/utils/bcrypt";
import { redirect } from "next/navigation";

export default async function cancelAppointment({ params }) {

    const redisLimit = await redisIpLimit(15, "cancel", 60 * 15);
    if (!redisLimit.ok) return <p>{redisLimit.message}</p>

    const { cancelToken, bookingPubId, adminPubId } = await params;

    if (!cancelToken || !bookingPubId || !adminPubId) return <p>Broken link. Email not found.</p>;

    const fetchAdmin = await db.execute(`SELECT id FROM admins WHERE public_id = ?`, [adminPubId]);
    if (fetchAdmin.rows.length === 0) return <p>Broken link. Email not found.</p>;

    const adminId = fetchAdmin.rows[0].id;

    try {
        const fetch = await db.execute(`SELECT id, cancel_token_hash FROM bookings WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);
        if (fetch.rows.length === 0) return <p>Broken link. Email not found.</p>;

        if (!fetch.rows[0].cancel_token_hash) {
            redirect(`/message/${bookingPubId}/${adminPubId}`);
        }


        const verified = await compare(cancelToken, fetch.rows[0].cancel_token_hash);
        if (!verified) return <p>Broken link. Email not found.</p>;

        await db.execute(`UPDATE bookings SET cancel_token_hash = NULL, status = 'cancelled' WHERE admin_id = ? AND public_id = ?`, [adminId, bookingPubId]);

    } catch (error) {
        console.error(error);
        return <p>Broken link. Email not found.</p>;
    }


    redirect(`/message/${bookingPubId}/${adminPubId}`);

}