"use server";

import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { rollingWindow } from "@/app/lib/rollingWindow";
import { nanoid } from "nanoid";
import { resetDatabase, initDatabase } from "@/app/Models/initTables";

// ─── Helpers ────────────────────────────────────────────────────────────────

const toHyphenSlug = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const toUnderscoreSlug = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

const todayUtc = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const addDaysUtc = (date, days) => {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
};

const isoDate = (date) => {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const dateParts = (date) => ({
    day_number: date.getUTCDay(),
    date_number: date.getUTCDate(),
    month_number: date.getUTCMonth(),
    year: date.getUTCFullYear(),
    booking_date_iso: isoDate(date),
});

const nextDateForDayNumber = (targetDayNumber, minimumOffsetDays = 2) => {
    const base = addDaysUtc(todayUtc(), minimumOffsetDays);
    const offset = (targetDayNumber - base.getUTCDay() + 7) % 7;
    return addDaysUtc(base, offset);
};

// ─── Credentials ────────────────────────────────────────────────────────────

const SEED_PASSWORD = "Admin@1234";

// Admin login to test:
//   username : seed-admin
//   password : Admin@1234

// ─── Hardcoded Data ─────────────────────────────────────────────────────────

const seedAdmin = {
    public_id: "seed_admin_001",
    admin_name: "Dr. Sarah Mitchell",
    admin_email: "admin@seedclinic.dev",
    admin_username: "seed-admin",
    clinic_name: "city-care-medical-center",
    clinic_phone: "+923001234567",
    clinic_address: "main-boulevard-gulberg-lahore",
};

const seedTreatments = [
    { key: "general_consultation", name: "General Consultation", duration: 30 },
    { key: "follow_up_visit", name: "Follow Up Visit", duration: 20 },
    { key: "dental_checkup", name: "Dental Checkup", duration: 45 },
    { key: "skin_consultation", name: "Skin Consultation", duration: 30 },
    { key: "cardiac_screening", name: "Cardiac Screening", duration: 60 },
    { key: "physiotherapy_session", name: "Physiotherapy Session", duration: 40 },
    { key: "eye_checkup", name: "Eye Checkup", duration: 25 },
    { key: "child_consultation", name: "Child Consultation", duration: 30 },
];

const seedDoctors = [
    {
        key: "dr_ahmed_raza",
        name: "Ahmed Raza",
        username: "dr-ahmed-raza",
        department: "General Medicine",
        qualifications: ["mbbs", "fcps"],
        treatments: ["general_consultation", "follow_up_visit", "cardiac_screening"],
        templates: [
            { day_number: 1, start_time: 540, end_time: 1020, break_start: 780, break_end: 825, buffer_minutes: 10 },
            { day_number: 3, start_time: 540, end_time: 1020, break_start: 780, break_end: 825, buffer_minutes: 10 },
            { day_number: 5, start_time: 600, end_time: 900, break_start: 720, break_end: 750, buffer_minutes: 5 },
        ],
    },
    {
        key: "dr_fatima_malik",
        name: "Fatima Malik",
        username: "dr-fatima-malik",
        department: "Dermatology",
        qualifications: ["mbbs", "ddsc"],
        treatments: ["skin_consultation", "follow_up_visit", "general_consultation"],
        templates: [
            { day_number: 2, start_time: 600, end_time: 1080, break_start: 840, break_end: 900, buffer_minutes: 10 },
            { day_number: 4, start_time: 600, end_time: 1080, break_start: 840, break_end: 900, buffer_minutes: 10 },
        ],
    },
    {
        key: "dr_usman_tariq",
        name: "Usman Tariq",
        username: "dr-usman-tariq",
        department: "Dentistry",
        qualifications: ["bds", "mcps"],
        treatments: ["dental_checkup", "follow_up_visit"],
        templates: [
            { day_number: 1, start_time: 900, end_time: 1260, break_start: 1050, break_end: 1080, buffer_minutes: 15 },
            { day_number: 3, start_time: 900, end_time: 1260, break_start: 1050, break_end: 1080, buffer_minutes: 15 },
            { day_number: 6, start_time: 600, end_time: 900, break_start: 720, break_end: 750, buffer_minutes: 10 },
        ],
    },
    {
        key: "dr_zara_hussain",
        name: "Zara Hussain",
        username: "dr-zara-hussain",
        department: "Ophthalmology",
        qualifications: ["mbbs", "doms"],
        treatments: ["eye_checkup", "follow_up_visit"],
        templates: [
            { day_number: 2, start_time: 540, end_time: 1020, break_start: 780, break_end: 825, buffer_minutes: 10 },
            { day_number: 5, start_time: 600, end_time: 960, break_start: 780, break_end: 810, buffer_minutes: 10 },
        ],
    },
    {
        key: "dr_bilal_khan",
        name: "Bilal Khan",
        username: "dr-bilal-khan",
        department: "Pediatrics",
        qualifications: ["mbbs", "dch"],
        treatments: ["child_consultation", "follow_up_visit", "general_consultation"],
        templates: [
            { day_number: 0, start_time: 600, end_time: 960, break_start: 780, break_end: 810, buffer_minutes: 5 },
            { day_number: 4, start_time: 600, end_time: 960, break_start: 780, break_end: 810, buffer_minutes: 5 },
        ],
    },
];

const seedPatients = [
    { name: "hamza-rauf", email: "hamza.rauf@patient.dev", phone: "+923331111201" },
    { name: "maryam-zafar", email: "maryam.zafar@patient.dev", phone: "+923331111202" },
    { name: "ali-rehman", email: "ali.rehman@patient.dev", phone: "+923331111203" },
    { name: "fatima-noor", email: "fatima.noor@patient.dev", phone: "+923331111204" },
    { name: "usman-tariq", email: "usman.tariq@patient.dev", phone: "+923331111205" },
    { name: "zoya-ahmed", email: "zoya.ahmed@patient.dev", phone: "+923331111206" },
    { name: "saad-khalid", email: "saad.khalid@patient.dev", phone: "+923331111207" },
    { name: "hina-aslam", email: "hina.aslam@patient.dev", phone: "+923331111208" },
    { name: "danish-iqbal", email: "danish.iqbal@patient.dev", phone: "+923331111209" },
    { name: "sana-butt", email: "sana.butt@patient.dev", phone: "+923331111210" },
    { name: "imran-sheikh", email: "imran.sheikh@patient.dev", phone: "+923331111211" },
    { name: "nadia-yasmin", email: "nadia.yasmin@patient.dev", phone: "+923331111212" },
];

// ─── Seeder Helpers ──────────────────────────────────────────────────────────

async function insertAdmin(passwordHash) {
    const result = await db.execute(
        `INSERT INTO admins (
            public_id, admin_name, admin_email, admin_username,
            clinic_name, clinic_phone, clinic_address,
            password, status, email_token_hash, email_token_created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'verified', NULL, NULL)
        RETURNING id, public_id`,
        [
            seedAdmin.public_id,
            toHyphenSlug(seedAdmin.admin_name),
            seedAdmin.admin_email,
            seedAdmin.admin_username,
            seedAdmin.clinic_name,
            seedAdmin.clinic_phone,
            seedAdmin.clinic_address,
            passwordHash,
        ]
    );
    const admin = result.rows[0];

    // Insert the admin user record so they can log in
    await db.execute(
        `INSERT INTO users (public_id, admin_id, role, username, password, status)
         VALUES (?, ?, 'admin', ?, ?, 'verified')`,
        [nanoid(12), admin.id, seedAdmin.admin_username, passwordHash]
    );

    return admin;
}

async function insertTreatments(adminId) {
    const treatmentMap = new Map();
    for (const t of seedTreatments) {
        const result = await db.execute(
            `INSERT INTO treatments (public_id, admin_id, name, duration)
             VALUES (?, ?, ?, ?)
             RETURNING id, public_id, name, duration`,
            [nanoid(12), adminId, toUnderscoreSlug(t.name), t.duration]
        );
        treatmentMap.set(t.key, result.rows[0]);
    }
    return treatmentMap;
}

async function insertDoctors(adminId, treatmentMap, passwordHash) {
    const doctorMap = new Map();
    for (const doc of seedDoctors) {
        const doctorResult = await db.execute(
            `INSERT INTO doctors (
                public_id, admin_id, name, qualifications,
                department, username, password, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'verified')
            RETURNING id, public_id, name`,
            [
                nanoid(12),
                adminId,
                toHyphenSlug(doc.name),
                JSON.stringify(doc.qualifications),
                toHyphenSlug(doc.department),
                doc.username,
                passwordHash,
            ]
        );
        const doctorRow = doctorResult.rows[0];
        doctorMap.set(doc.key, doctorRow);

        // Doctor user login record
        await db.execute(
            `INSERT INTO users (public_id, doctor_id, role, username, password, status)
             VALUES (?, ?, 'doctor', ?, ?, 'verified')`,
            [nanoid(12), doctorRow.id, doc.username, passwordHash]
        );

        // Link treatments to doctor
        for (const tKey of doc.treatments) {
            const treatment = treatmentMap.get(tKey);
            if (!treatment) continue;
            await db.execute(
                `INSERT INTO doctor_treatments (public_id, admin_id, doctor_id, treatment_id)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(admin_id, doctor_id, treatment_id) DO NOTHING`,
                [nanoid(12), adminId, doctorRow.id, treatment.id]
            );
        }

        // Insert weekly schedule templates
        for (const tmpl of doc.templates) {
            await db.execute(
                `INSERT INTO weekly_templates (
                    public_id, admin_id, doctor_id, day_number,
                    start_time, end_time, break_start, break_end, buffer_minutes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(admin_id, doctor_id, day_number) DO NOTHING`,
                [
                    nanoid(12),
                    adminId,
                    doctorRow.id,
                    tmpl.day_number,
                    tmpl.start_time,
                    tmpl.end_time,
                    tmpl.break_start,
                    tmpl.break_end,
                    tmpl.buffer_minutes,
                ]
            );
        }
    }
    return doctorMap;
}

async function insertBookings(adminId, doctorMap, treatmentMap) {
    const bookingStatuses = ["verified", "verified", "pending", "unverified", "cancelled", "revoked"];
    let bookingCount = 0;
    let patientIndex = 0;

    for (const doc of seedDoctors) {
        const doctorRow = doctorMap.get(doc.key);
        if (!doctorRow) continue;

        const primaryTreatment = treatmentMap.get(doc.treatments[0]);
        if (!primaryTreatment) continue;

        const firstTemplate = doc.templates[0];
        const secondTemplate = doc.templates[1] || doc.templates[0];

        const proposedBookings = [
            {
                date: nextDateForDayNumber(firstTemplate.day_number, 2),
                start: firstTemplate.start_time + 30,
                status: bookingStatuses[bookingCount % bookingStatuses.length],
            },
            {
                date: nextDateForDayNumber(secondTemplate.day_number, 5),
                start: secondTemplate.break_end + 30,
                status: bookingStatuses[(bookingCount + 1) % bookingStatuses.length],
            },
        ];

        for (const proposed of proposedBookings) {
            const patient = seedPatients[patientIndex % seedPatients.length];
            const treatment_end = proposed.start + primaryTreatment.duration;
            const parts = dateParts(proposed.date);

            await db.execute(
                `INSERT INTO bookings (
                    public_id, admin_id, doctor_id, treatment_id,
                    doctor_name, patient_name, patient_email, patient_phone,
                    treatment_start, treatment_end,
                    day_number, date_number, month_number, year, booking_date_iso,
                    status,
                    email_token_hash, email_token_created_at,
                    cancel_token_hash, cancel_token_created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL)
                ON CONFLICT DO NOTHING`,
                [
                    nanoid(12),
                    adminId,
                    doctorRow.id,
                    primaryTreatment.id,
                    doctorRow.name,
                    patient.name,
                    patient.email,
                    patient.phone,
                    proposed.start,
                    treatment_end,
                    parts.day_number,
                    parts.date_number,
                    parts.month_number,
                    parts.year,
                    parts.booking_date_iso,
                    proposed.status,
                ]
            );

            patientIndex += 1;
            bookingCount += 1;
        }
    }

    return bookingCount;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * seedDatabase()
 *
 * Call this from any route (API route, Server Action, page, etc.).
 * It will:
 *   1. Reset the database (drop all tables)
 *   2. Recreate all tables via initDatabase()
 *   3. Insert one admin, 5 doctors, 8 treatments, templates, and ~10 bookings
 *
 * Admin login credentials:
 *   username : seed-admin
 *   password : Admin@1234
 */
export async function seedDatabase() {
    try {
        // 1. Wipe everything
        await resetDatabase();

        // 2. Recreate all tables
        const initResult = await initDatabase();
        if (!initResult.ok) {
            return { ok: false, message: `Table init failed: ${initResult.message}` };
        }

        // 3. Hash the shared password once
        const passwordHash = await hash(SEED_PASSWORD);

        // 4. Insert admin
        const admin = await insertAdmin(passwordHash);

        // 5. Insert treatments
        const treatmentMap = await insertTreatments(admin.id);

        // 6. Insert doctors, their treatment links, and weekly templates
        const doctorMap = await insertDoctors(admin.id, treatmentMap, passwordHash);

        // 7. Generate slots for the next 31 days based on templates
        await rollingWindow(admin.id, 31);

        // 8. Insert sample bookings
        const bookingCount = await insertBookings(admin.id, doctorMap, treatmentMap);

        return {
            ok: true,
            message: "Database seeded successfully.",
            summary: {
                admin: 1,
                doctors: seedDoctors.length,
                treatments: treatmentMap.size,
                templates: seedDoctors.reduce((sum, d) => sum + d.templates.length, 0),
                bookings: bookingCount,
            },
            credentials: {
                adminUsername: seedAdmin.admin_username,
                password: SEED_PASSWORD,
                doctorUsernames: seedDoctors.map((d) => d.username),
            },
        };
    } catch (error) {
        console.error("seedDatabase error:", error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : String(error),
        };
    }
}