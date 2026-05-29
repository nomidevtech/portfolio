import { db } from "@/app/lib/turso";


export async function GET(request) {

    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    try {
        await db.execute(`
        DELETE FROM bookings
        WHERE status IN ('pending', 'unverified')
        AND booking_registered_at <= DATETIME('now', '-30 minutes')
    `);
    } catch (error) {
        console.error("Ghost booking cleanup failed:", error);
        return Response.json({ success: false, message: "Cleanup failed" }, { status: 500 });
    }

    return Response.json({
        success: true,
        message: "Ghost bookings cleaned",
    });
}
