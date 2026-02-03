"use server";

import connectDB from "../../Lib/mongoose";
import Post from "../../../Models/Post";
import Taxonomy from "../../../Models/Taxonomy";
import cloudinary from "@/app/Lib/cloudinary";

// import { testConnection } from "@/app/Lib/turso";



// export async function handleTest() {
//   const result = await testConnection();
//   console.log(result);
//   return result;
// }

// handleTest();






export async function ServerAction(formData) {
  try {
    // 1️⃣ Extract scalar + serialized values safely
    const title = formData.get("title")?.trim();
    if (!title) throw new Error("Title is required");

    const rawTaxonomies = formData.get("taxonomies") || "[]";
    const taxonomies = JSON.parse(rawTaxonomies);
    console.log('here======>>>>>>', taxonomies)

    const rawBlocks = formData.get("blocks");
    if (!rawBlocks) throw new Error("Blocks are required");
    const blocks = JSON.parse(rawBlocks);

    // 2️⃣ Connect to MongoDB
    await connectDB();

    // 3️⃣ Resolve taxonomies
    const taxFromDB = [];
    for (const name of taxonomies) {
      let tax = await Taxonomy.findOne({ name });
      if (!tax) {
        tax = await Taxonomy.create({ name });
      }
      taxFromDB.push(tax._id);
    }

    // 4️⃣ Upload image blocks to Cloudinary
    for (const block of blocks) {
      if (block.type === "image") {
        const file = formData.get(block.fileKey);
        if (!file) throw new Error(`Missing file for block ${block.fileKey}`);

        const buffer = Buffer.from(await file.arrayBuffer());

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "Blog-Imgs" },
            (err, res) => (err ? reject(err) : resolve(res))
          ).end(buffer);
        });

        // normalize block
        delete block.fileKey;
        block.url = result.secure_url;
        block.publicId = result.public_id;
      }
    }

    // 5️⃣ Persist post
    const post = await Post.create({
      title,
      taxonomies: taxFromDB,
      content: JSON.stringify(blocks),
      isPublished: true,
    });
    console.log("✅ Post created with ID:", post._id.toString());

    // 6️⃣ Return success
    return {
      ok: true,
      id: post._id.toString(),
    };
  } catch (error) {
    console.error("ServerAction error:", error);
    return {
      ok: false,
      error: error.message || "Failed to create post",
    };
  }
}
