import { rollingWindow } from "@/app/lib/rollingWindow";


export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    try {
        await rollingWindow();
    } catch (error) {
        console.error("Cron job failed:", error);
        return Response.json({ success: false, message: "Cron job failed" }, { status: 500 });
    }

    return Response.json({ success: true, message: `cron ran at ${Date.now()}` });
}
