import { db } from "../lib/turso";

export async function initDoctorTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY,
                public_id TEXT,
                admin_id INTEGER,
                name TEXT,
                qualifications TEXT,
                department TEXT,
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
                public_id TEXT,
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
                admin_id INTEGER NOT NULL,
                doctor_id INTEGER NOT NULL,
                treatment_id INTEGER NOT NULL,
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


                UNIQUE(admin_id, doctor_id, month_number, year, date_number) ON CONFLICT REPLACE,

                FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
                FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
            )
        `);
    } catch (error) {
        console.error("Failed to initialize slots table:", error);
        throw error;
    }
}

// we will make now admin table following

export async function initAdminTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY,
                public_id TEXT,
                name TEXT,
                email TEXT,
                password TEXT,
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
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                public_id TEXT NOT NULL UNIQUE,
                admin_id INTEGER NOT NULL,
                doctor_id INTEGER NOT NULL,
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
                treatment_id INTEGER,
                status TEXT DEFAULT 'pending',
                email_token_hash TEXT,
                email_token_created_at DEFAULT NULL,
                cancel_token_hash TEXT,
                cancel_token_created_at DEFAULT NULL,
                booking_registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE NO ACTION,
                FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE NO ACTION,
                FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE NO ACTION,
                
                UNIQUE(
                    doctor_id, 
                    day_number, 
                    date_number, 
                    month_number, 
                    year, 
                    treatment_start, 
                    treatment_end
                ) ON CONFLICT IGNORE
            )
        `);

        return { ok: true, message: "bookings table created" };

    } catch (error) {
        console.error("Database Init Error:", error);
        return { ok: false, message: error instanceof Error ? error.message : String(error) };
    }
}