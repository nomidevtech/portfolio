'use server'

import { cookies } from "next/headers";
import { db } from "./turso";
import { redirect } from "next/navigation";

export async function logout(formData) {


    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (token) {
            await db.execute(`DELETE FROM sessions WHERE token = ?`, [token]);
        }

        cookieStore.delete('token');

    } catch (err) {
        console.error('Logout error:', err);
    }

    // Always redirect outside the try/catch
    redirect('/login');
}