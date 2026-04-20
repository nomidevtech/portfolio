"use server";

import { cookies } from "next/headers";

export async function getSession(name) {

    const cookieStore = await cookies();
    const token = cookieStore.get(name);

    if (!token) return null;
    return token.value;

}