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
        console.log(error);
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
                FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        return { ok: true, message: "users table initialized" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error creating users table" };
    }
}


export async function initPlansTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS plans (
                id INTEGER PRIMARY KEY,
                public_id TEXT NOT NULL,
                speed INTEGER UNIQUE,
                rate INTEGER 
            )
        `);

        return { ok: true, message: "plans table initialized" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error creating plans table" };
    }
};



export async function initUserPlansTable() {
    try {
        await db.execute(`
           CREATE TABLE IF NOT EXISTS user_plans (
            user_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, plan_id),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);

        return { ok: true, message: "user_plans table initialized" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error creating user_plans table" };
    }
};