"use server";

import cloudinary from "@/app/Lib/cloudinary";
import { db } from "@/app/Lib/turso";
import { redirect } from "next/navigation";

export default async function delServerAction(postId) {
  try {
    const postRow = (
      await db.execute(`SELECT content FROM posts WHERE id = ?`, [postId])
    ).rows[0];

    if (!postRow) {
      return { ok: false, message: "Post not found" };
    }

    const postContent = JSON.parse(postRow.content);

    for (const pc of postContent) {
      if (pc.type === "image" && pc.publicId) {
        await cloudinary.uploader.destroy(pc.publicId);
      }
    }

    await db.execute(`DELETE FROM post_taxonomies WHERE post_id = ?`, [postId]);
    await db.execute(`DELETE FROM post_tags WHERE post_id = ?`, [postId]);

    await db.execute(`DELETE FROM posts WHERE id = ?`, [postId]);

  } catch (err) {
    console.log(err);
    return { ok: false, message: err.message };
  }

  redirect("/blog");
}