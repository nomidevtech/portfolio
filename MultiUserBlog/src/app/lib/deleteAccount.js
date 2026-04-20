"use server";

import { redirect } from "next/navigation";
import { getUser } from "./getUser";
import { db } from "@/app/lib/turso";
import { cookies } from "next/headers";
import { cloudinaryDeleteMultiple } from "./cloudinary";
import { compare } from "../utils/bcrypt";
import { redis } from "./redis";
import { headers } from "next/headers";
import { redisIpLimit } from "../utils/redidIpLimit";

export async function deleteAccount(_, formData) {
    try {

        const ipLimit = await redisIpLimit(5, 'delete_account');
        if (!ipLimit.ok) return ipLimit;



        const password = formData?.get('password');
        if (!password) return { ok: false, message: "Password is required." };

        const currentUser = await getUser();
        if (!currentUser?.id) return { ok: false, message: "You must be logged in to delete your account." };

        const hashedPass = await db.execute(`SELECT password FROM users WHERE id = ?`, [currentUser.id]);
        if (hashedPass.rows.length === 0 || !hashedPass.rows[0].password) return { ok: false, message: "User not found." };

        const isPasswordCorrect = await compare(password, hashedPass?.rows[0]?.password);
        if (!isPasswordCorrect) return { ok: false, message: "Incorrect password." };


        const cookieStore = await cookies();

        const fetchPostsContent = await db.execute(`
            SELECT content FROM posts WHERE user_id = ?
        `, [currentUser.id]);


        const cloudinaryIdsToDelete = fetchPostsContent.rows
            .flatMap(row => JSON.parse(row.content))
            .filter(item => item.type === 'image' && item.value?.publicId)
            .map(item => item.value.publicId);

        if (cloudinaryIdsToDelete.length > 0) {
            await cloudinaryDeleteMultiple(cloudinaryIdsToDelete);
        }


        await db.execute('DELETE FROM users WHERE id = ?', [currentUser.id]);

        cookieStore.delete("mub-session-token");

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong." };
    }
    redirect("/sign-up");
}