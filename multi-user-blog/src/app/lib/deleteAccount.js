"use server";

import { redirect } from "next/navigation";
import { getUser } from "./getUser";
import { db } from "@/app/lib/turso";
import { cookies } from "next/headers";
import { cloudinaryDeleteMultiple } from "./cloudinary";

export async function deleteAccount() {

    const cookieStore = await cookies();


    try {

        const currentUser = await getUser();
        if (!currentUser?.id) return null;

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
        return null;
    }
    redirect("/sign-up");
}