"use server";

import { db } from "@/app/Lib/turso";
import cloudinary from "@/app/Lib/Static/cloudinary";
import { hashPassword } from "@/app/Lib/hashPassword";
import slugGenerator from "@/app/utils/slugGenerator";
import { redirect } from "next/navigation";




export async function ServerAction(formData) {

  // create and load tables

  try {
    // Users table
    await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Guest',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

    // Partial unique index: ensures only ONE admin
    await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS one_admin_idx
    ON users(role)
    WHERE role = 'admin' COLLATE NOCASE
`);

    await db.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);


    // TAGS
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL      
      )
   `)

    // TAXNONOMIES

    await db.execute(`
      CREATE TABLE IF NOT EXISTS taxonomies (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL      
      )
   `)

    // POSTS
    await db.execute(`
    CREATE TABLE IF NOT EXISTS posts(
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    excerpt TEXT,
    slug TEXT,
    content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) 
    )
    `)

    // POST_TAGS
    await db.execute(`
      CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY( post_id, tag_id),
      FOREIGN KEY(post_id) REFERENCES posts(id),
      FOREIGN KEY(tag_id) REFERENCES tags(id)
      )
      `)

    // POST_TAXONOMIES
    await db.execute(`
      CREATE TABLE IF NOT EXISTS post_taxonomies (
      post_id INTEGER,
      taxonomy_id INTEGER,
      PRIMARY KEY( post_id, taxonomy_id),
      FOREIGN KEY(post_id) REFERENCES posts(id),
      FOREIGN KEY(taxonomy_id) REFERENCES taxonomies(id)
      )
      `)






    // 1️⃣ Extract scalar + serialized values safely
    const title = formData.get("title")?.trim();
    if (!title) throw new Error("Title is required");

    const slug = slugGenerator(title);
    console.log('hey i am slug-------->>>>>>>', slug);

    const excerpt = formData.get('excerpt');

    const taxonomy = formData.get('taxonomy');
    if (!taxonomy) throw new Error("Taxonomy is required");

    const rawTagsFromForm = formData.get("tags");
    const tagsFromForm = JSON.parse(rawTagsFromForm);
    if (!tagsFromForm) throw new Error('select at least one tag');

    const blocks = JSON.parse(formData.get("blocks"));
    if (!blocks) throw new Error('add data for post');
    // blocks will be mutated inside as loop will mutate intented indices following.




    try {
      for (const block of blocks) {
        if (block.type === "image") {
          const file = formData.get(block.fileKey);
          // if (!file) throw new Error(`Missing file for block ${block.fileKey}`);

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

    } catch (err) {
      console.log(err);
      throw err;
    }

    // Inserting data to tables
    const myPass = 'IamGhost'
    const myHashPass = await hashPassword(myPass);


    try {
      const result = await db.execute({
        sql: `INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`,
        args: ["nomi", myHashPass, "admin"],
      });

      for (const tag of tagsFromForm) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO tags (name) VALUES (?)`,
          args: [tag]
        });
      }


      const placeHolders = tagsFromForm.map(t => '?').join(',');


      const insertTaxonomy = await db.execute(`INSERT OR IGNORE INTO taxonomies (name) VALUES (?)`, [taxonomy]);



      const taxonomyID = (await db.execute(`SELECT id FROM taxonomies WHERE name = ? `, [taxonomy])).rows[0].id;


      let tagIdsForJunction = [];

      if (tagsFromForm.length > 0) {
        tagIdsForJunction = (await db.execute({
          sql: `SELECT id from tags WHERE name IN (${placeHolders})`,
          args: tagsFromForm // cus its already an array
        })).rows.map(r => r.id);
        console.log('i am ids from db =====>>>>>>>>>', tagIdsForJunction);
      }





      const addPostToDB = await db.execute({
        sql: `INSERT INTO posts (user_id, title, excerpt, slug, content) VALUES(?, ?, ?, ?, ?) RETURNING id`,
        args: [1, title, excerpt, slug, JSON.stringify(blocks)]
      });

      const postID = addPostToDB.rows[0].id;

      if (tagIdsForJunction.length > 0 && postID) {
        for (let tagId of tagIdsForJunction) {
          await db.execute({
            sql: `INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)`,
            args: [postID, tagId]
          })
        }

      }


      await db.execute({
        sql: `INSERT OR IGNORE INTO post_taxonomies (post_id, taxonomy_id) VALUES (?, ?)`,
        args: [postID, taxonomyID]
      });

      console.log('successfull entering data to tables');

    } catch (err) {
      console.log('error while entering data to tables. Here is the error==>>>', err)
      throw err;
    }




    // return { status: "success", message: "Post created successfully!" };

  } catch (error) {
    console.error("ServerAction error:", error);
    return {
      ok: false,
      error: error.message || "Failed to create post",
    };
  }

  redirect('/blog');
}







