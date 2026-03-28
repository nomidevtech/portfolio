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



export async function initBilling_transactionsTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS billing_transactions (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
            public_id TEXT NOT NULL,
            plan_snapshot TEXT NOT NULL,
            billing_month INTEGER NOT NULL,
            billing_year INTEGER NOT NULL,
            fee_status TEXT DEFAULT 'unpaid',
            amount_due INTEGER DEFAULT 0,
            amount_paid INTEGER DEFAULT 0,
            remaining_fee INTEGER DEFAULT 0,
            fee_snapshot TEXT NOT NULL,
            username_snapshot TEXT NOT NULL,
            invoice_id TEXT UNIQUE NOT NULL,
            entry_date TEXT DEFAULT CURRENT_TIMESTAMP
            )`
        );

        return { ok: true, message: "billing_transactions table initialized" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error creating billing_transactions table" };
    }
};