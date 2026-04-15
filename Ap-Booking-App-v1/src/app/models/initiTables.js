"use server";

import { db } from "../lib/turso";

export async function initBookingsTable() {
  try {
    await db.execute(`
          CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          public_id TEXT,
          patient_name TEXT,
          patient_email TEXT,
          patient_phone TEXT,
          treatment_type TEXT,
          treatment_start INTEGER,
          treatment_end INTEGER,
          date INTEGER,
          month_name TEXT,
          month_number INTEGER,
          day_name TEXT,
          day_number INTEGER,
          booking_registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'pending'
          )`
    );

    return { ok: true, message: "bookings table created" }

  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
};

export async function initWeeklyTemplateTable() {
  try {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS weekly_template (
        id INTEGER PRIMARY KEY,
        public_id TEXT,
        day TEXT UNIQUE,
        day_number INTEGER UNIQUE DEFAULT 1,
        start_time INTEGER DEFAULT 540,
        end_time INTEGER DEFAULT 1020,
        break_start INTEGER DEFAULT 720,
        break_end INTEGER DEFAULT 780,
        buffer_minutes INTEGER DEFAULT 10
        )`
    );

    return { ok: true, message: "weekly_template table created" }
  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
}