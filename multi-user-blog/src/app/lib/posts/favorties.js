"use server";

import { getUser } from "../getUser";
import { db } from "../turso";

export async function addTofavorties(_, formData) {

  const ppid = formData.get("ppid");
  if (!ppid) {
    return { ok: false, message: "Post public id is broken or missing." };
  }

  const currentUser = await getUser();
  if (!currentUser) {
    return { ok: false, message: "User needs to be logged in." };
  }

  const getPost = await db.execute(
    `SELECT id FROM posts WHERE public_id = ?`,
    [ppid]
  );

  if (getPost.rows.length === 0) {
    return { ok: false, message: "Post not found." };
  }

  try {

    // await db.execute(`
    //   CREATE TABLE IF NOT EXISTS favorites (
    //   user_id INTEGER,
    //   post_id INTEGER,
    //   PRIMARY KEY (user_id, post_id),
    //   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    //   FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
    //   )
    // `);



    const postId = getPost.rows[0].id;

    const favs = await db.execute(
      `SELECT * FROM favorites WHERE user_id = ? AND post_id = ?`,
      [currentUser.id, postId]
    );
    if (favs.rows.length === 0) {
      const result = await db.execute(
        `INSERT INTO favorites (user_id, post_id) VALUES (?, ?)`,
        [currentUser.id, postId]
      )
      if (result.rowsAffected === 0) return { ok: false, message: "failed to add to favorites." };

      return { ok: true, message: "Post added to favorites." };


    } else if (favs.rows.length > 0) {
      const result = await db.execute(
        `DELETE FROM favorites WHERE user_id = ? AND post_id = ?`,
        [currentUser.id, postId]
      )
      if (result.rowsAffected === 0) return { ok: false, message: "failed to remove from favorites." };

      return { ok: true, message: "Post removed from favorites." };

    }


  } catch (error) {
    console.error(error);
    return { ok: false, message: "Something went wrong." };
  }
}