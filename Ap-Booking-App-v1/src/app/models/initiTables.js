"use server";

import { db } from "../lib/turso";

export async function initSlotTalbe() {
  try {

    await db.execute(`
      CREATE TABLE IF NOT EXISTS slots (
        id INTEGER PRIMARY KEY,
        base_slot TEXT,
        booking_slots TEXT
      )
      `)

    return { ok: true, message: "slots table created" }


  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
}