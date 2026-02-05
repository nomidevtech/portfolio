"use server";

import { db } from "@/app/Lib/turso";
import cloudinary from "@/app/Lib/cloudinary";

export async function ServerAction(formData) {
  try {
    // 1️⃣ Database Initialization (Keep outside transaction)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL DEFAULT 'Guest',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL      
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        title TEXT,
        taxonomy TEXT NOT NULL,
        content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER,
        tag_id INTEGER, 
        PRIMARY KEY(post_id, tag_id),
        FOREIGN KEY(post_id) REFERENCES posts(id),
        FOREIGN KEY(tag_id) REFERENCES tags(id)
      )
    `);

    // 2️⃣ Data Extraction & Parsing
    const title = formData.get("title")?.trim();
    const taxonomy = formData.get('taxonomy');
    const tagsFromForm = JSON.parse(formData.get("tags") || "[]");
    const blocks = JSON.parse(formData.get("blocks") || "[]");

    // 3️⃣ Cloudinary Image Processing
    for (const block of blocks) {
      if (block.type === "image" && block.fileKey) {
        const file = formData.get(block.fileKey);
        if (file) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: "Blog-Imgs" },
              (err, res) => (err ? reject(err) : resolve(res))
            ).end(buffer);
          });

          delete block.fileKey;
          block.url = uploadResult.secure_url;
          block.publicId = uploadResult.public_id;
        }
      }
    }

    // 4️⃣ Execute Managed Transaction
    // This handles BEGIN, COMMIT, and ROLLBACK automatically
    const transactionResult = await db.transaction("immediate", async (tx) => {
      
      // A. Ensure a user exists (Required for Foreign Key in posts)
      await tx.execute({
        sql: `INSERT OR IGNORE INTO users (id, username, type) VALUES (?, ?, ?)`,
        args: [1, "nomi", "Admin"],
      });

      // B. Insert Post (Fixed the missing comma between taxonomy and content)
      const insertedPost = await tx.execute({
        sql: `INSERT INTO posts (user_id, title, taxonomy, content) VALUES(?, ?, ?, ?) RETURNING id`,
        args: [1, title, taxonomy, JSON.stringify(blocks)]
      });

      const postID = insertedPost.rows[0].id;

      // C. Insert New Tags
      for (let tag of tagsFromForm) {
        await tx.execute({
          sql: `INSERT OR IGNORE INTO tags (name) VALUES(?)`,
          args: [tag]
        });
      }

      // D. Map Tags to Post in Junction Table
      if (tagsFromForm.length > 0) {
        const placeHolders = tagsFromForm.map(() => '?').join(',');
        const tagIdsRows = await tx.execute({
          sql: `SELECT id from tags WHERE name IN (${placeHolders})`,
          args: tagsFromForm
        });

        for (let row of tagIdsRows.rows) {
          await tx.execute({
            sql: `INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES(?, ?)`,
            args: [postID, row.id]
          });
        }
      }

      return { postID }; // Return a plain object
    });

    // 5️⃣ Final Success Return (Ensuring no complex prototypes)
    return {
      ok: true,
      message: "Post created successfully!",
      postId: transactionResult.postID
    };

  } catch (error) {
    console.error("ServerAction error:", error);
    // Never return the raw Error object to the client
    return {
      ok: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}