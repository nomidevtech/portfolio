"use server";

import { redirect } from "next/navigation";
import { getUser } from "./getUser";
import { db } from "@/app/lib/turso";
import { cookies } from "next/headers";


export async function logout() {

    const cookieStore = await cookies();


    try {

        const currentUser = await getUser();
        if (!currentUser) return null;

        await db.execute('DELETE FROM sessions WHERE user_id = ?', [currentUser.id]);

        cookieStore.delete("mub-session-token");

    } catch (error) {
        console.error(error);
        return null;
    }
    redirect("/login");
}