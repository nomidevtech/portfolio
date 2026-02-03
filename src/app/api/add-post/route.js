// app/api/add-post/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
    const formData = await req.formData();
    for (const [key, value] of formData.entries()) {
        console.log(key, value);
    }
    return NextResponse.json({ success: true });
}
