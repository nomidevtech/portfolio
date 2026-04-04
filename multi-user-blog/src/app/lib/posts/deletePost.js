"use server";

import { redirect } from "next/navigation";
import { db } from "../turso";
import { getUser } from "../getUser";
import { cloudinaryDeleteMultiple } from "../cloudinary";


export async function deletePostServerAction(_, formData) {

    const ppid = formData.get('ppid');
    if (!ppid) {
        return { ok: false, message: "Post public id is broken or missing." };
    }


    try {

        const currentUser = await getUser();
        if (!currentUser?.id) {
            return { ok: false, message: "User needs to be logged in." };
        }


        const fetchPost = await db.execute(`SELECT id, user_id, content FROM posts WHERE public_id = ?`, [ppid]);

        if (fetchPost.rows.length === 0) {
            return { ok: false, message: "Post not found." };
        }

        if (fetchPost?.rows[0]?.user_id !== currentUser?.id) {
            return { ok: false, message: "You are not authorized to delete this post." };
        }

        const postId = fetchPost?.rows[0]?.id;

        const result = await db.execute(`DELETE FROM posts WHERE id = ?`, [postId]);

        if (result.rowsAffected === 0) {
            return { ok: false, message: "failed to delete post" };
        }
        const acquireImag = JSON.parse(fetchPost.rows[0].content);
        const ids = [];
        if(acquireImag.length > 0) {
            for (const block of acquireImag) {
                if (block.type === "image" && block.value?.publicId) {
                    ids.push(block.value.publicId);
                }
            }
        }
        if(ids.length > 0) {
            await cloudinaryDeleteMultiple(ids);
        }

        //return { ok: true, message: "post deleted" };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
    redirect("/blog");
}