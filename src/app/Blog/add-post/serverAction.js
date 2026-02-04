"use server";

import { db } from "@/app/Lib/turso";




export async function ServerAction(formData) {

  // create and load tables

  try {

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL DEFAULT 'Guest',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP

      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
      )
      `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL      
      )
   `)

    await db.execute(`
    CREATE TABLE IF NOT EXISTS posts(
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    user_ID INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
    )
    `)

    console.log("✅ Tables created or already EXISTS");


    // // 1️⃣ Extract scalar + serialized values safely
    // const title = formData.get("title")?.trim();
    // if (!title) throw new Error("Title is required");

    // const rawTaxonomies = formData.get("taxonomies") || "[]";
    // const taxonomies = JSON.parse(rawTaxonomies);
    // console.log('here======>>>>>>', taxonomies)

    // const rawBlocks = formData.get("blocks");
    // if (!rawBlocks) throw new Error("Blocks are required");
    // const blocks = JSON.parse(rawBlocks);



    // // 3️⃣ Resolve taxonomies
    // const taxFromDB = [];
    // for (const name of taxonomies) {
    //   let tax = await Taxonomy.findOne({ name });
    //   if (!tax) {
    //     tax = await Taxonomy.create({ name });
    //   }
    //   taxFromDB.push(tax._id);
    // }





  } catch (error) {
    console.error("ServerAction error:", error);
    return {
      ok: false,
      error: error.message || "Failed to create post",
    };
  }
}







