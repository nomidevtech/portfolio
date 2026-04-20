"use server";

import { db } from "../lib/turso";

export async function initBookingsTable() {
  try {
    await db.execute(`
          CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          public_id TEXT,
          doctor_id INTEGER,
          doctor_name TEXT,
          patient_name TEXT,
          patient_email TEXT,
          patient_phone TEXT,
          treatment_type TEXT,
          treatment_start INTEGER,
          treatment_end INTEGER,
          date INTEGER,
          month_name TEXT,
          month_number INTEGER,
          year INTEGER,
          day_name TEXT,
          day_number INTEGER,
          booking_registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'pending',
          FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
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
        status INTEGER DEFAULT 1,
        doctor_id INTEGER,
        day TEXT,
        day_number INTEGER DEFAULT 1,
        month_name TEXT DEFAULT 'January',
        month_number INTEGER DEFAULT 1,
        year INTEGER DEFAULT 2025,
        date INTEGER DEFAULT 1,
        start_time INTEGER DEFAULT 540,
        end_time INTEGER DEFAULT 1020,
        break_start INTEGER DEFAULT 720,
        break_end INTEGER DEFAULT 780,
        buffer_minutes INTEGER DEFAULT 10,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (doctor_id, date, month_number, year),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
        )`
    );



    return { ok: true, message: "weekly_template table created" }
  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
};



export async function initDoctorsTable() {
  try {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY,
        public_id TEXT,
        department TEXT,
        name TEXT,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    );



    return { ok: true, message: "doctors table created" }
  } catch (error) {
    console.log(error);
    return { ok: false, message: error.message }
  }
}