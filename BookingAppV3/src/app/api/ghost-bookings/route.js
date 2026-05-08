import { db } from "@/app/lib/turso";


export async function GET(request) {

    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    await db.execute(`
        DELETE FROM bookings
        WHERE status = 'pending'
        AND booking_registered_at <= DATETIME('now', '-30 minutes')
    `);

    return Response.json({
        success: true,
        message: "Ghost bookings cleaned",
    });
}