"use server";

import cloudinary from "@/app/Lib/Static/cloudinary";
import { db } from "@/app/Lib/turso";
import slugGenerator from "@/app/utils/slugGenerator";
import { redirect } from "next/navigation";

export default async function editServerAction(formData) {

  console.log('iam formData------------>', formData)
  try {
    const postId = formData.get("postId");
    const title = formData.get("title")?.trim();
    const slug = slugGenerator(title);
    const excerpt = formData.get("excerpt")?.trim();
    const taxonomyName = formData.get("taxonomy")?.trim();

    const tagsRaw = formData.get("tags")?.trim();

    // convert tags string -> array
    const tags = tagsRaw
      ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    // build content array
    const tempArr = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("heading")) tempArr.push({ type: "heading", value });
      if (key.startsWith("paragraph")) tempArr.push({ type: "paragraph", value });
      if (key.startsWith("image_url")) {
        const { url, publicId } = JSON.parse(value)
        tempArr.push({ type: "image", url, publicId });
      }
    }

    const content = JSON.stringify(tempArr);

    console.log('i am content===============>', content)

    // -------------------------------
    // STEP 1: Update posts table
    // -------------------------------
    await db.execute(
      `
        UPDATE posts
        SET title = ?, slug = ?, excerpt = ?, content = ?, last_edited_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [title, slug, excerpt, content, postId]
    );

    // -------------------------------
    // STEP 2: TAXONOMY handling
    // -------------------------------

    // Insert taxonomy if not exists
    await db.execute(
      `INSERT OR IGNORE INTO taxonomies (name) VALUES (?)`,
      [taxonomyName]
    );

    // get taxonomy id
    const taxonomyResult = await db.execute(
      `SELECT id FROM taxonomies WHERE name = ?`,
      [taxonomyName]
    );

    const taxonomyId = taxonomyResult.rows[0].id;

    // remove old taxonomy relation
    await db.execute(
      `DELETE FROM post_taxonomies WHERE post_id = ?`,
      [postId]
    );

    // insert new taxonomy relation
    await db.execute(
      `INSERT INTO post_taxonomies (post_id, taxonomy_id) VALUES (?, ?)`,
      [postId, taxonomyId]
    );

    // -------------------------------
    // STEP 3: TAGS handling
    // -------------------------------

    // delete old tag relations
    await db.execute(
      `DELETE FROM post_tags WHERE post_id = ?`,
      [postId]
    );

    // insert new tags and relations
    for (const tag of tags) {
      await db.execute(
        `INSERT OR IGNORE INTO tags (name) VALUES (?)`,
        [tag]
      );

      const tagResult = await db.execute(
        `SELECT id FROM tags WHERE name = ?`,
        [tag]
      );

      const tagId = tagResult.rows[0].id;

      await db.execute(
        `INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
        [postId, tagId]
      );
    }

    // -------------------------------
    // STEP 4: delete removed cloudinary images (optional)
    // -------------------------------
    // you need to compare old publicIds from DB vs new publicIds
    // currently you're not storing them properly, so skip for now.

  } catch (err) {
    console.error(err);
    return { ok: false, message: err.message };
  }

  //redirect(`/blog/${formData.get("postId")}/${formData.get("slug")}`);
  redirect(`/blog/`);
}