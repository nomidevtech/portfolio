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
};




export async function initSlotPerDayTalbe() {
  try {

    await db.execute(`
        CREATE TABLE IF NOT EXISTS slotPerDay (
        id INTEGER PRIMARY KEY,
        public_id TEXT,
        day TEXT UNIQUE,
        start_time INTEGER DEFAULT 540,
        end_time INTEGER DEFAULT 1020,
        break_start INTEGER DEFAULT 720,
        break_end INTEGER DEFAULT 780,
        buffer_minutes INTEGER DEFAULT 10
        )`
    );

    return { ok: true, message: "slotPerDay table created" }
  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
}