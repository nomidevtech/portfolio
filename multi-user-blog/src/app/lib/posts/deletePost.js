"use server";

export async function deletePostServerAction(_, formData) {

    const ppid = formData.get('post_public_id');
    if (!ppid) {
        return { ok: false, message: "Post public id is broken or missing." };
    }

    try {

        const fetchPost = await db.execute(`SELECT id FROM posts WHERE public_id = ?`, [ppid]);
        if (fetchPost.rows.length === 0) {
            return { ok: false, message: "Post not found." };
        }

        const postId = fetchPost.rows[0].id;

        const result = await db.execute(`DELETE FROM posts WHERE id = ?`, [postId]);

        if (result.rowsAffected === 0) {
            return { ok: false, message: "failed to delete post" };
        }

        return { ok: true, message: "post deleted" };

    } catch (error) {
        console.error(error);
        return { ok: false, message: "Something went wrong" };
    }
}