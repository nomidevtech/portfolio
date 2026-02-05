"use server";

import { db } from "@/app/Lib/turso";
import cloudinary from "@/app/Lib/cloudinary";




export async function ServerAction(formData) {

  // create and load tables

  try {
    // USERS
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'Guest',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP

      )
    `);
    // // TAXONOMIES
    // await db.execute(`
    //   CREATE TABLE IF NOT EXISTS taxonomies (
    //   id INTEGER PRIMARY KEY,
    //   name TEXT UNIQUE NOT NULL
    //   )
    //   `)

    // TAGS
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
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
    taxonomy TEXT NOT NULL,
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






    // 1️⃣ Extract scalar + serialized values safely
    const title = formData.get("title")?.trim();
    // if (!title) throw new Error("Title is required");

    const taxonomy = formData.get('taxonomy');
    // if (!taxonomy) throw new Error("Taxonomy is required");

    const rawTagsFromForm = formData.get("tags") || "[]";
    const tagsFromForm = JSON.parse(rawTagsFromForm);
    // console.log('here======>>>>>>', tags)

    const rawBlocks = formData.get("blocks");
    // if (!rawBlocks) throw new Error("Blocks are required");
    const blocks = JSON.parse(rawBlocks);
    // blocks will be mutated inside as loop will mutate intented indices following.




    try {
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

    } catch (err) {
      console.log(err);
    }


    const tagFromDB = (await db.execute(`SELECT name FROM tags`)).rows
    // name-filtering tags from db
    const tagNamesFromDB = tagFromDB.map(t => t.name);
    // using filter on Tags that came from form cus only it could have new tags not the db.
    const newTags = tagsFromForm.filter(t => !tagNamesFromDB.includes(t));




    await db.execute('BEGIN');
    try {

      const insertedPost = await db.execute({
        sql: `INSERT OR IGNORE INTO posts (user_id, title, taxonomy, content) VALUES(?, ?, ?, ?) RETURNING id`,
        args: [1, title, taxonomy, JSON.stringify(blocks)]
      });

      const postID = insertedPost.rows[0].id;


      if (newTags.length > 0) {
        for (let tag of newTags) {
          await db.execute({
            sql: `INSERT OR IGNORE INTO tags (name) VALUES(?)`,
            args: [tag]
          })
        }
      }

      const placeHolders = tagsFromForm.map(t => '?').join(',');

      const tagIdsForJunction = (await db.execute({
        sql: `SELECT id from tags WHERE name IN (${placeHolders})`,
        args: tagsFromForm // cus its already an array
      })).rows.map(r => r.id);

      for (let tagId of tagIdsForJunction) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES(?, ?)`,
          args: [postID, tagId]
        });
      };

      await db.execute('COMMIT');
      console.log('psot+tags saved successfully');



    } catch (err) {
      await db.execute('ROLLBACK');
      throw err;
    }






    console.log('i am ids from db =====>>>>>>>>>', idsForJunction);



    // const addPostToDB= await db.execute()













    // const tagsFromDB = (await db.execute((` SELECT * From tags `))).rows
    // const tagsFromDBNameFiltered = tagsFromDB.map(t => t.name);
    // const tagsFromDBIDFiltered = tagsFromDB.map(t => t.id);
    // const newTags = tagsFromForm.filter(t => !tagsFromDBNameFiltered.includes(t));
    // if (newTags) {
    //   for (let newTag of newTags) {
    //     await db.execute({
    //       sql: `INTERT OR INGNORE INTO tags (name) VALUE(?)`,
    //       args: [`${newTag}`]
    //     })
    //   }
    // }
    //  const idsForJunctionTable = (await db.execute((` SELECT * From tags `))).rows.map(row=>{
    //   row.name.includes(tagsFromForm)? return row.id : null;
    //  })


    // const existingTagsForNewPost = tagsFromDB.map(t => { })
    // console.log('tags from db======>>>>>>>>>', tagsFromDB);
    // console.log('newtags from db======>>>>>>>>>', newTags);













    // console.log(blocks)

    // const images = blocks.filter(b => b.type === 'image').map(m => formData.get(m.fileKey));

    // if (!images) throw new Error("no image detected");

    // console.log(`here are the images after filter and map ====>>>>>>`, images)


    // let sortedContent = blocks.map((b, i) => {
    //   if (b.type === 'image') {
    //     b.file = formData.get(b.fileKey);
    //   }
    //   return b
    // })



    // CREATE TABLE IF NOT EXISTS posts(
    // id INTEGER PRIMARY KEY,
    // title TEXT,
    // content TEXT,
    // created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    // user_ID INTEGER,
    // FOREIGN KEY(user_id) REFERENCES users(id)
    // )


    // Inserting User into users table
    try {
      const result = await db.execute({
        sql: `INSERT OR IGNORE INTO users (username, type) VALUES (?, ?)`,
        args: ["nomi", "Admin"],
      });


    } catch (error) {
      console.log(error)
    }

    // Inserting Tags into TAGS table
    try {
      for (let tag of newTags) {
        const result = await db.execute({
          sql: `INSERT OR IGNORE INTO tags (name) VALUES (?)`,
          args: [`${tag}`],
        });
        console.log('tags added========>>>>>>>>', result)

      }

    } catch (error) {
      console.log(error)
    }




    // try {
    //   const result = await db.execute({
    //     sql: `INSERT OR IGNORE INTO posts (title, content, user_id, taxonomy, ) VALUES (?, ?, ?, ?)`,
    //     args: [`${title}`, `${JSON.stringify(blocks)}`, 1, taxonomy,]
    //   });

    //   return { ok: true, message: "Success", result };
    // } catch (error) {
    //   console.log(error)
    // }












    // return { status: "success", message: "Post created successfully!" };

  } catch (error) {
    console.error("ServerAction error:", error);
    return {
      ok: false,
      error: error.message || "Failed to create post",
    };
  }
}







