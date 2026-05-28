import { db } from "../lib/turso";

export async function initAdminsTable() {
    try {
        await db.execute("PRAGMA foreign_keys = ON;");
        await db.execute(`
                    CREATE TABLE IF NOT EXISTS admins (
                    id INTEGER PRIMARY KEY,
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
                    username TEXT NOT NULL,
                    password TEXT DEFAULT NULL,
                    contact INTEGER DEFAULT 0,
                    plan_id INTEGER,
                    FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE ON UPDATE CASCADE,
                    FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE SET NULL,
                    UNIQUE(admin_id, username)
                    )`
        );

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
                    admin_id INTEGER NOT NULL,
                    speed INTEGER,
                    rate INTEGER,
                    FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE ON UPDATE CASCADE
                    )
                    `);

        return { ok: true, message: "plans table initialized" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error creating plans table" };
    }
}

export async function initBilling_transactionsTable() {
    try {
        await db.execute(`
                    CREATE TABLE IF NOT EXISTS billing_transactions (
                    id INTEGER PRIMARY KEY,
                    public_id TEXT,

                    user_id INTEGER,   
                    admin_id INTEGER,

                    billing_month INTEGER,
                    billing_year INTEGER,

                    fee_status TEXT DEFAULT 'unpaid',
                    amount_due INTEGER DEFAULT 0,
                    amount_paid INTEGER DEFAULT 0,
                    remaining_fee INTEGER DEFAULT 0,

                    plan_snapshot TEXT,
                    fee_snapshot TEXT,
                    username_snapshot TEXT,
                    contact_snapshot INTEGER DEFAULT 0,
                    password_snapshot TEXT DEFAULT NULL,

                    invoice_id TEXT UNIQUE DEFAULT NULL,

                    entry_date TEXT DEFAULT CURRENT_TIMESTAMP,
                    last_updated TEXT DEFAULT CURRENT_TIMESTAMP,

                    UNIQUE(user_id, billing_month, billing_year),

                    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                    )`
        );

        return { ok: true, message: "billing_transactions table initialized" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error creating billing_transactions table" };
    }
}

export async function initSessionsTable() {
    try {
        await db.execute(`
                    CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY,
                    session_id TEXT NOT NULL UNIQUE,
                    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
                    expires_at TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT (datetime('now'))
                    )
                    `);

        return { ok: true, message: "sessions table initialized" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error creating sessions table" };
    }
}

export async function initAllTables() {
    try {
        await db.execute("PRAGMA foreign_keys = ON;");

        const adminsResult = await initAdminsTable();
        if (!adminsResult.ok) return adminsResult;

        const plansResult = await initPlansTable();
        if (!plansResult.ok) return plansResult;

        const usersResult = await initUsersTable();
        if (!usersResult.ok) return usersResult;

        const billingTransactionsResult = await initBilling_transactionsTable();
        if (!billingTransactionsResult.ok) return billingTransactionsResult;

        const sessionsResult = await initSessionsTable();
        if (!sessionsResult.ok) return sessionsResult;

        return { ok: true, message: "All tables initialized" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error initializing all tables" };
    }
}

export async function resetDb() {
    try {
        await db.execute("PRAGMA foreign_keys = OFF;");

        await db.execute("DROP TABLE IF EXISTS sessions;");
        await db.execute("DROP TABLE IF EXISTS billing_transactions;");
        await db.execute("DROP TABLE IF EXISTS users;");
        await db.execute("DROP TABLE IF EXISTS plans;");
        await db.execute("DROP TABLE IF EXISTS admins;");

        await db.execute("PRAGMA foreign_keys = ON;");

        return { ok: true, message: "Database reset" };
    } catch (error) {
        console.log(error);
        return { ok: false, message: "Error resetting database" };
    }
}