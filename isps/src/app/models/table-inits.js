import { db } from "../lib/turso";

export async function initAdminsTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                public_id TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                password TEXT 
            )
        `);

        return { ok: true, message: "Admins table initialized" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error creating admins table" };
    }
}

export async function initUsersTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                public_id TEXT NOT NULL,
                admin_id INTEGER NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password TEXT,
                contact INTEGER,
                FOREIGN KEY (admin_id) REFERENCES admins (id) 
            )
        `);

        return { ok: true, message: "users table initialized" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error creating users table" };
    }
}