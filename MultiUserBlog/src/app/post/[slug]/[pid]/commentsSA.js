"use server";

import { getUser } from "@/app/lib/getUser";
import { db } from "@/app/lib/turso";
import { nanoid } from "nanoid";

export async function commentsSA(_, formData) {

    // await db.execute(`
    //         CREATE TABLE IF NOT EXISTS comments (
    //             id INTEGER PRIMARY KEY AUTOINCREMENT,
    //             public_id TEXT NOT NULL,
    //             user_id INTEGER NOT NULL,
    //             post_id INTEGER NOT NULL,
    //             username TEXT NOT NULL,
    //             comment TEXT NOT NULL,
    //             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //             updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //             FOREIGN KEY(user_id) REFERENCES users(id),
    //             FOREIGN KEY(post_id) REFERENCES posts(id),
    //             FOREIGN KEY(username) REFERENCES users(username)
    //         )
    //     `);


    try {


        const ToDelete = formData.get("delete");
        let comment_public_id = formData.get("comment_public_id") || null;
        const user_public_id = formData.get("user_public_id");
        const post_public_id = formData.get("post_public_id");
        const comment = formData.get("comment");



        if (!user_public_id || !post_public_id || (!comment && !ToDelete)) {
            return { ok: false, message: "Required fields are missing" };
        }

        if (comment && comment.length > 1000) {
            return { ok: false, message: "Comment must be under 1000 characters" };
        }



        const currentUser = await getUser();

        if (!currentUser?.id || currentUser.email_verified === 0 || currentUser.public_id !== user_public_id) {
            return { ok: false, message: "Unauthorized request. Use a verified account" };
        }

        if (ToDelete) {
            const getComment = await db.execute(
                `SELECT id, user_id FROM comments WHERE public_id = ?`,
                [comment_public_id]
            );

            if (!getComment.rows.length) {
                return { ok: false, message: "Comment not found" };
            }

            if (getComment.rows[0].user_id !== currentUser.id) {
                return { ok: false, message: "Unauthorized" };
            }

            await db.execute(`DELETE FROM comments WHERE public_id = ?`, [comment_public_id]);
            return { ok: true, deleted: true, cPId: comment_public_id, message: "Comment deleted successfully" };
        }

        if (!comment_public_id) {
            const getPostId = await db.execute(
                `SELECT id FROM posts WHERE public_id = ?`,
                [post_public_id]
            );

            if (!getPostId.rows.length) {
                return { ok: false, message: "Post not found" };
            }

            const new_public_id = nanoid();
            await db.execute(
                `INSERT INTO comments (public_id, user_id, post_id, username, comment)
                 VALUES (?, ?, ?, ?, ?)`,
                [new_public_id, currentUser.id, getPostId.rows[0].id, currentUser.username, comment]
            );

            return {
                ok: true,
                message: "Comment created successfully",
                comment,
                username: currentUser.username,
                cPId: new_public_id,
                inserted: true
            };
        }

        const fetchComment = await db.execute(
            `SELECT id, user_id FROM comments WHERE public_id = ?`,
            [comment_public_id]
        );

        if (!fetchComment.rows.length) {
            return { ok: false, message: "Comment not found" };
        }

        if (fetchComment.rows[0].user_id !== currentUser.id) {
            return { ok: false, message: "Unauthorized" };
        }

        await db.execute(
            `UPDATE comments
             SET comment = ?, updated_at = CURRENT_TIMESTAMP
             WHERE public_id = ?`,
            [comment, comment_public_id]
        );

        return {
            ok: true,
            message: "Comment updated successfully",
            comment,
            username: currentUser.username,
            cPId: comment_public_id,
            updated: true
        };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
}