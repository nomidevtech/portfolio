

export function GET(request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    console.log("API route was called after env before check");
    console.log("AUTH HEADER:", authHeader);
    console.log("CRON SECRET EXISTS:", !!cronSecret);
    console.log("CRON SECRET LENGTH:", cronSecret?.length);


    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return new Response('Unauthorized', {
            status: 401,
        });
    }

    console.log("API route was called after env");

    return Response.json({ success: true, message: "Hello from API" });
}





// export default async function GET() {
//     console.log("API route was called");

//     return Response.json({
//         message: "Hello from API"
//     });
// }