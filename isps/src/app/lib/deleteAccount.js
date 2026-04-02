"use server";

import { redirect } from "next/navigation";
import { getUser } from "./getUser";
import { db } from "@/app/lib/turso";
import { cookies } from "next/headers";
import { redisIpLimit } from "../utils/redidIpLimit";

export async function deleteAccount(_, formData) {
    try {

        const ipLimit = await redisIpLimit(5, 'delete_account');
        if (!ipLimit.ok) return ipLimit;



        const password = formData?.get('password');
        if (!password) return { ok: false, message: "Password is required." };

        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, message: "You must be logged in to delete your account." };

        const fetchPass = await db.execute(`SELECT password FROM admins WHERE id = ?`, [currentUser.id]);
        const currentPassword = fetchPass.rows[0].password;

        if (password !== currentPassword) return { ok: false, message: "Incorrect password." };


        const cookieStore = await cookies();






        await db.execute('DELETE FROM admins WHERE id = ?', [currentUser.id]);

        cookieStore.delete("isp-token");

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong." };
    }
    redirect("/signup");
}