import { db } from "../lib/turso";

export async function initUsersTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                public_id TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                password TEXT 
            )
        `);

        return { ok: true, message: "Users table initialized" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error creating users table" };
    }
}

export async function initConsumersTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS consumers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                public_id TEXT NOT NULL,
                admin_id INTEGER NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                password TEXT,
                FOREIGN KEY (admin_id) REFERENCES users (id) 
            )
        `);

        return { ok: true, message: "Consumers table initialized" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error creating consumers table" };
    }
}