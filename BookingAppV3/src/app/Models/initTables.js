import { db } from "../lib/turso";

export async function initDatabase() {

    try {

        // parent tables first
        await initAdminTable();
        await initDoctorTable();
        await initTreatmentTable();

        // tables depending on doctors/admins/treatments
        await initDoctorTreatmentsTable();
        await initWeeklyTemplatesTable();
        await initSlotsTable();
        await initBookingsTable();

        // auth/user tables
        await initUsersTable();
        await initSessionsTable();

        return {
            ok: true,
            message: "All tables initialized successfully"
        };

    } catch (error) {

        console.error("Database initialization failed:", error);

        return {
            ok: false,
            message: error instanceof Error
                ? error.message
                : String(error)
        };
    }
}

export async function resetDatabase() {

    await db.execute(`PRAGMA foreign_keys = OFF`);

    await db.execute(`DROP TABLE IF EXISTS sessions`);
    await db.execute(`DROP TABLE IF EXISTS users`);
    await db.execute(`DROP TABLE IF EXISTS bookings`);
    await db.execute(`DROP TABLE IF EXISTS slots`);
    await db.execute(`DROP TABLE IF EXISTS weekly_templates`);
    await db.execute(`DROP TABLE IF EXISTS doctor_treatments`);
    await db.execute(`DROP TABLE IF EXISTS treatments`);
    await db.execute(`DROP TABLE IF EXISTS doctors`);
    await db.execute(`DROP TABLE IF EXISTS admins`);

    await db.execute(`PRAGMA foreign_keys = ON`);
}

export async function initDoctorTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY,
                public_id TEXT UNIQUE,
                admin_id INTEGER,
                name TEXT,
                qualifications TEXT,
                department TEXT,
                username TEXT UNIQUE,
                password TEXT,
                status TEXT DEFAULT 'verified',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function initTreatmentTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS treatments (
                id INTEGER PRIMARY KEY,
                public_id TEXT UNIQUE,
                admin_id INTEGER,
                name TEXT,
                duration INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (error) {
        console.error(error);
        throw error;
    }
};


export async function initDoctorTreatmentsTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS doctor_treatments (
                public_id TEXT NOT NULL UNIQUE,
                admin_id INTEGER,
                doctor_id INTEGER,
                treatment_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                PRIMARY KEY (admin_id, doctor_id, treatment_id),
                
                FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
                FOREIGN KEY (treatment_id) REFERENCES treatments (id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error("Failed to initialize doctor_treatments table:", error);
        throw error;
    }
};


export async function initWeeklyTemplatesTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS weekly_templates (
                id INTEGER PRIMARY KEY,
                public_id TEXT UNIQUE,
                admin_id INTEGER,
                doctor_id INTEGER,
                day_number INTEGER,
                start_time INTEGER,
                end_time INTEGER,
                break_start INTEGER,
                break_end INTEGER,
                buffer_minutes INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                UNIQUE(admin_id, doctor_id, day_number),
                
                FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
                FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error("Failed to initialize weekly_templates table:", error);
        throw error;
    }
}


export async function initSlotsTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS slots (
                id INTEGER PRIMARY KEY,
                public_id TEXT UNIQUE,
                status TEXT DEFAULT 'active',
                admin_id INTEGER,
                doctor_id INTEGER,
                day_number INTEGER,
                month_number INTEGER,
                year INTEGER,
                date_number INTEGER,
                start_time INTEGER,
                end_time INTEGER,
                break_start INTEGER,
                break_end INTEGER,
                buffer_minutes INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                full_date_at_period TEXT,


                UNIQUE(admin_id, doctor_id, full_date_at_period) ON CONFLICT IGNORE,

                FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
                FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error("Failed to initialize slots table:", error);
        throw error;
    }
}


export async function initAdminTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY,
                public_id TEXT UNIQUE,
                admin_name TEXT,
                admin_email TEXT UNIQUE,
                admin_username TEXT UNIQUE,
                clinic_name TEXT,
                clinic_phone TEXT,
                clinic_address TEXT,
                password TEXT,
                email_token_hash TEXT,
                recovery_token_hash TEXT,
                recovery_token_created_at DEFAULT NULL,
                status TEXT DEFAULT 'unverified',
                email_token_created_at DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (error) {
        console.error(error);
        throw error;
    }
}


export async function initBookingsTable() {
    try {

        await db.execute(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY,
                public_id TEXT UNIQUE,

                admin_id INTEGER,
                doctor_id INTEGER,
                treatment_id INTEGER,

                doctor_name TEXT,

                patient_name TEXT,
                patient_email TEXT,
                patient_phone TEXT,

                treatment_start INTEGER,
                treatment_end INTEGER,

                day_number INTEGER,
                date_number INTEGER,
                month_number INTEGER,
                year INTEGER,

                booking_date_iso TEXT,

                status TEXT DEFAULT 'pending',

                email_token_hash TEXT,
                email_token_created_at DATETIME DEFAULT NULL,

                cancel_token_hash TEXT,
                cancel_token_created_at DATETIME DEFAULT NULL,

                booking_registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
                FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL,
                FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
            );
        `);

        await db.execute(`
            CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booking 
            ON bookings(
                admin_id,
                doctor_id,
                booking_date_iso,
                treatment_start,
                treatment_end
            )
            WHERE status IN ('pending', 'verified' , 'unverified');
        `);

        return {
            ok: true,
            message: "bookings table created"
        };

    } catch (error) {

        console.error("Database Init Error:", error);

        return {
            ok: false,
            message: error instanceof Error
                ? error.message
                : String(error)
        };
    }
}





export async function initUsersTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                public_id TEXT UNIQUE,
                admin_id INTEGER,
                doctor_id INTEGER,
                role TEXT,
                username TEXT UNIQUE,
                password TEXT,
                status TEXT DEFAULT 'unverified',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error(error);
        throw error;
    }
}




export async function initSessionsTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY,
                session_id TEXT UNIQUE,
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error(error);
        throw error;
    }
}