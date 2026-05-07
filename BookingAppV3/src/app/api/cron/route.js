import { rollingWindow } from "@/app/lib/rollingWindow";


export async function GET(request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    console.log("API route was called after env before check");
    console.log("AUTH HEADER:", authHeader);
    console.log("CRON SECRET EXISTS:", !!cronSecret);
    console.log("CRON SECRET LENGTH:", cronSecret?.length);
    console.log(`cron ran at ${Date.now()}`);


    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    await rollingWindow();

    console.log("API route was called after env");
    console.log(`cron ran after rollong window at ${Date.now()}`);

    return Response.json({ success: true, message: `cron ran at ${Date.now()}` });
}




