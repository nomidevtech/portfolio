// src/middleware.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminLoginCheck } from "@/app/Lib/adminLoginCheck";

export async function middleware(req) {
    console.log("Middleware fired");

    const cookieStore = cookies();
    const token = cookieStore.get("session-token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const adminCheck = await adminLoginCheck(token);

    if (!adminCheck.ok) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

