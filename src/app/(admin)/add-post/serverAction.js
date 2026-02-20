"use server";

import cloudinary from "@/app/Lib/cloudinary";
import slugGenerator from "@/app/utils/slugGenerator";
import { redirect } from "next/navigation";

import { TagModel } from "@/app/Models/Tag";
import { PostModel } from "@/app/Models/Post";
import { Post_Tag_Model } from "@/app/Models/Post_Tag";
import { TaxonomyModel } from "@/app/Models/Taxonomy";
import { Post_Taxonomy_Model } from "@/app/Models/Post_Taxonomy";

import { db } from "@/app/Lib/turso";
import getSession from "@/app/Lib/getSession";
import getUser from "@/app/Lib/getUser";



export async function ServerAction(formData) {

  const session = await getSession();
  if (!session.ok) return { ok: false, message: 'Unauthorized' };
  const userRes = await getUser(session.session.user_id);
  if (!userRes.ok || userRes.user?.role !== 'admin') return { ok: false, message: 'Forbidden' };

  try {

    const tagModel = new TagModel();
    const postModel = new PostModel();
    const postTagModel = new Post_Tag_Model();
    const taxonomyModel = new TaxonomyModel();
    const postTaxonomyModel = new Post_Taxonomy_Model();


    const title = formData.get("title")?.trim();
    if (!title) throw new Error("Title is required");

    const slug = slugGenerator(title);
    const excerpt = formData.get("excerpt")?.trim() || "";
    const taxonomy = formData.get("taxonomy")?.trim();
    if (!taxonomy) throw new Error("Taxonomy is required");

    const rawTagsFromForm = formData.get("tags");
    if (!rawTagsFromForm) throw new Error("Select at least one tag");

    const tagsFromForm = JSON.parse(rawTagsFromForm);
    if (!Array.isArray(tagsFromForm) || tagsFromForm.length === 0) throw new Error("Select at least one tag");

    const rawBlocks = formData.get("blocks");
    if (!rawBlocks) throw new Error("Add content for post");

    const blocks = JSON.parse(rawBlocks);
    if (!Array.isArray(blocks) || blocks.length === 0) throw new Error("Add content for post");


    for (const block of blocks) {
      if (block.type === "image") {
        const file = formData.get(block.fileKey);
        if (!file) throw new Error(`Missing file for image block: ${block.fileKey}`);

        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ folder: "Blog-Imgs" }, (err, res) => (err ? reject(err) : resolve(res)))
            .end(buffer);
        });

        delete block.fileKey;
        block.url = result.secure_url;
        block.publicId = result.public_id;
      }
    }


    const taxonomyInsert = await taxonomyModel.insert({ data: { name: taxonomy } });
    if (!taxonomyInsert.ok) throw new Error(taxonomyInsert.message || "Taxonomy insert failed");

    const taxonomyId = taxonomyInsert.returnId;
    if (!taxonomyId) throw new Error("Failed to fetch taxonomy id");


    for (const tag of tagsFromForm) {
      const tagInsert = await tagModel.insert({ data: { name: tag } });
      if (!tagInsert.ok) throw new Error(tagInsert.message);
    }


    const placeholders = tagsFromForm.map(() => "?").join(",");
    const tagRows = await db.execute(`SELECT id FROM tags WHERE name IN (${placeholders})`, tagsFromForm);
    const tagIdsForJunction = tagRows.rows.map(r => r.id);


    const postInsertResult = await postModel.insert({
      data: {
        user_id: session.session.user_id,
        title,
        excerpt,
        slug,
        content: JSON.stringify(blocks)
      }
    });

    if (!postInsertResult.ok) throw new Error(postInsertResult.message || "Post insert failed");
    const postId = postInsertResult.returnId;
    if (!postId) throw new Error("Post insert did not return id");


    for (const tagId of tagIdsForJunction) {
      const postTagInsert = await postTagModel.insert({ data: { post_id: postId, tag_id: tagId } });
      if (!postTagInsert.ok) throw new Error(postTagInsert.message);
    }


    const postTaxonomyInsert = await postTaxonomyModel.insert({
      data: { post_id: postId, taxonomy_id: taxonomyId }
    });
    if (!postTaxonomyInsert.ok) throw new Error(postTaxonomyInsert.message);



  } catch (error) {
    console.error("ServerAction error:", error);
    return { ok: false, error: error.message || "Failed to create post" };
  }
  redirect("/blog");
}