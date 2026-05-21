"use server";

import { db } from "@/app/lib/turso";
import { hash } from "@/app/utils/bcrypt";
import { rollingWindow } from "@/app/lib/rollingWindow";
import { nanoid } from "nanoid";

const DEMO_EMAIL_DOMAIN = "clinicflow.demo";
const DEMO_PASSWORD = "DemoPass123!";

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

const sqlPlaceholders = (count) => Array.from({ length: count }, () => "?").join(", ");

const demoBranches = [
    {
        key: "central",
        public_id: "demo_branch_central",
        admin_name: "Demo Central Admin",
        admin_email: `central@${DEMO_EMAIL_DOMAIN}`,
        admin_username: "demo-central-admin",
        clinic_name: "healing-hands-central-branch",
        clinic_phone: "+923001110001",
        clinic_address: "blue-area-islamabad",
        treatments: [
            { key: "general_consultation", name: "General Consultation", duration: 30 },
            { key: "follow_up_visit", name: "Follow Up Visit", duration: 20 },
            { key: "dental_scaling", name: "Dental Scaling", duration: 45 },
            { key: "skin_consultation", name: "Skin Consultation", duration: 30 },
            { key: "cardiac_screening", name: "Cardiac Screening", duration: 60 },
            { key: "physiotherapy_session", name: "Physiotherapy Session", duration: 40 },
        ],
        doctors: [
            {
                key: "ayesha_khan",
                name: "Ayesha Khan",
                username: "demo-dr-ayesha",
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
                key: "bilal_saeed",
                name: "Bilal Saeed",
                username: "demo-dr-bilal",
                department: "Dentistry",
                qualifications: ["bds", "mcps"],
                treatments: ["dental_scaling", "general_consultation", "follow_up_visit"],
                templates: [
                    { day_number: 2, start_time: 600, end_time: 1080, break_start: 840, break_end: 900, buffer_minutes: 15 },
                    { day_number: 4, start_time: 600, end_time: 1080, break_start: 840, break_end: 900, buffer_minutes: 15 },
                    { day_number: 6, start_time: 540, end_time: 780, break_start: 660, break_end: 675, buffer_minutes: 10 },
                ],
            },
            {
                key: "sana_malik",
                name: "Sana Malik",
                username: "demo-dr-sana",
                department: "Dermatology",
                qualifications: ["mbbs", "ddsc"],
                treatments: ["skin_consultation", "follow_up_visit", "general_consultation"],
                templates: [
                    { day_number: 1, start_time: 900, end_time: 1260, break_start: 1050, break_end: 1080, buffer_minutes: 10 },
                    { day_number: 2, start_time: 900, end_time: 1260, break_start: 1050, break_end: 1080, buffer_minutes: 10 },
                    { day_number: 4, start_time: 900, end_time: 1260, break_start: 1050, break_end: 1080, buffer_minutes: 10 },
                ],
            },
        ],
    },
    {
        key: "north",
        public_id: "demo_branch_north",
        admin_name: "Demo North Admin",
        admin_email: `north@${DEMO_EMAIL_DOMAIN}`,
        admin_username: "demo-north-admin",
        clinic_name: "healing-hands-north-branch",
        clinic_phone: "+923001110002",
        clinic_address: "f-10-markaz-islamabad",
        treatments: [
            { key: "child_consultation", name: "Child Consultation", duration: 30 },
            { key: "vaccination", name: "Vaccination", duration: 15 },
            { key: "orthopedic_assessment", name: "Orthopedic Assessment", duration: 45 },
            { key: "xray_review", name: "Xray Review", duration: 20 },
            { key: "nutrition_counselling", name: "Nutrition Counselling", duration: 40 },
        ],
        doctors: [
            {
                key: "omar_farooq",
                name: "Omar Farooq",
                username: "demo-dr-omar",
                department: "Pediatrics",
                qualifications: ["mbbs", "dch"],
                treatments: ["child_consultation", "vaccination", "nutrition_counselling"],
                templates: [
                    { day_number: 0, start_time: 600, end_time: 960, break_start: 780, break_end: 810, buffer_minutes: 5 },
                    { day_number: 2, start_time: 600, end_time: 960, break_start: 780, break_end: 810, buffer_minutes: 5 },
                    { day_number: 4, start_time: 600, end_time: 960, break_start: 780, break_end: 810, buffer_minutes: 5 },
                ],
            },
            {
                key: "nadia_shah",
                name: "Nadia Shah",
                username: "demo-dr-nadia",
                department: "Orthopedics",
                qualifications: ["mbbs", "ms"],
                treatments: ["orthopedic_assessment", "xray_review", "follow_up_visit"],
                templates: [
                    { day_number: 1, start_time: 660, end_time: 1110, break_start: 840, break_end: 900, buffer_minutes: 15 },
                    { day_number: 3, start_time: 660, end_time: 1110, break_start: 840, break_end: 900, buffer_minutes: 15 },
                    { day_number: 5, start_time: 660, end_time: 930, break_start: 780, break_end: 810, buffer_minutes: 10 },
                ],
            },
        ],
    },
    {
        key: "south",
        public_id: "demo_branch_south",
        admin_name: "Demo South Admin",
        admin_email: `south@${DEMO_EMAIL_DOMAIN}`,
        admin_username: "demo-south-admin",
        clinic_name: "healing-hands-south-branch",
        clinic_phone: "+923001110003",
        clinic_address: "bahria-town-rawalpindi",
        treatments: [
            { key: "ent_consultation", name: "ENT Consultation", duration: 30 },
            { key: "hearing_test", name: "Hearing Test", duration: 45 },
            { key: "eye_checkup", name: "Eye Checkup", duration: 30 },
            { key: "vision_screening", name: "Vision Screening", duration: 20 },
            { key: "physiotherapy_session", name: "Physiotherapy Session", duration: 40 },
        ],
        doctors: [
            {
                key: "hassan_ali",
                name: "Hassan Ali",
                username: "demo-dr-hassan",
                department: "ENT",
                qualifications: ["mbbs", "fcps"],
                treatments: ["ent_consultation", "hearing_test", "follow_up_visit"],
                templates: [
                    { day_number: 1, start_time: 570, end_time: 990, break_start: 780, break_end: 825, buffer_minutes: 10 },
                    { day_number: 2, start_time: 570, end_time: 990, break_start: 780, break_end: 825, buffer_minutes: 10 },
                    { day_number: 6, start_time: 600, end_time: 900, break_start: 720, break_end: 750, buffer_minutes: 5 },
                ],
            },
            {
                key: "laiba_noor",
                name: "Laiba Noor",
                username: "demo-dr-laiba",
                department: "Ophthalmology",
                qualifications: ["mbbs", "doms"],
                treatments: ["eye_checkup", "vision_screening", "follow_up_visit"],
                templates: [
                    { day_number: 3, start_time: 600, end_time: 1080, break_start: 840, break_end: 900, buffer_minutes: 10 },
                    { day_number: 4, start_time: 600, end_time: 1080, break_start: 840, break_end: 900, buffer_minutes: 10 },
                    { day_number: 5, start_time: 600, end_time: 900, break_start: 735, break_end: 765, buffer_minutes: 10 },
                ],
            },
        ],
    },
];

const demoPatients = [
    { name: "hamza-rauf", email: `hamza.rauf@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111101" },
    { name: "maryam-zafar", email: `maryam.zafar@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111102" },
    { name: "ali-rehman", email: `ali.rehman@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111103" },
    { name: "fatima-noor", email: `fatima.noor@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111104" },
    { name: "usman-tariq", email: `usman.tariq@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111105" },
    { name: "zoya-ahmed", email: `zoya.ahmed@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111106" },
    { name: "saad-khalid", email: `saad.khalid@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111107" },
    { name: "hina-aslam", email: `hina.aslam@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111108" },
    { name: "danish-iqbal", email: `danish.iqbal@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111109" },
    { name: "maha-saleem", email: `maha.saleem@${DEMO_EMAIL_DOMAIN}`, phone: "+923331111110" },
];

const sharedTreatments = [
    { key: "follow_up_visit", name: "Follow Up Visit", duration: 20 },
];

async function deleteExistingDemoData() {
    const existing = await db.execute(
        `SELECT id FROM admins WHERE admin_email LIKE ?`,
        [`%@${DEMO_EMAIL_DOMAIN}`]
    );

    const adminIds = existing.rows.map((row) => row.id);
    if (adminIds.length === 0) return { deletedBranches: 0 };

    const placeholders = sqlPlaceholders(adminIds.length);

    await db.batch(
        [
            {
                sql: `DELETE FROM bookings WHERE admin_id IN (${placeholders})`,
                args: adminIds,
            },
            {
                sql: `DELETE FROM admins WHERE id IN (${placeholders})`,
                args: adminIds,
            },
        ],
        "write"
    );

    return { deletedBranches: adminIds.length };
}

async function seedAdmin({ branch, passwordHash }) {
    const result = await db.execute(
        `INSERT INTO admins (
      public_id,
      admin_name,
      admin_email,
      admin_username,
      clinic_name,
      clinic_phone,
      clinic_address,
      password,
      status,
      email_token_hash,
      email_token_created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'verified', NULL, NULL)
    RETURNING id, public_id`,
        [
            branch.public_id,
            toHyphenSlug(branch.admin_name),
            branch.admin_email,
            branch.admin_username,
            branch.clinic_name,
            branch.clinic_phone,
            branch.clinic_address,
            passwordHash,
        ]
    );

    const admin = result.rows[0];

    await db.execute(
        `INSERT INTO users (public_id, admin_id, role, username, password, status)
     VALUES (?, ?, 'admin', ?, ?, 'verified')`,
        [nanoid(12), admin.id, branch.admin_username, passwordHash]
    );

    return admin;
}

async function seedTreatments({ adminId, branch }) {
    const treatmentMap = new Map();
    const mergedTreatments = [...sharedTreatments, ...branch.treatments];

    for (const treatment of mergedTreatments) {
        const existingByKey = treatmentMap.get(treatment.key);
        if (existingByKey) continue;

        const result = await db.execute(
            `INSERT INTO treatments (public_id, admin_id, name, duration)
       VALUES (?, ?, ?, ?)
       RETURNING id, public_id, name, duration`,
            [nanoid(12), adminId, toUnderscoreSlug(treatment.name), treatment.duration]
        );

        treatmentMap.set(treatment.key, result.rows[0]);
    }

    return treatmentMap;
}

async function seedDoctors({ adminId, branch, passwordHash, treatmentMap }) {
    const doctorMap = new Map();

    for (const doctor of branch.doctors) {
        const doctorResult = await db.execute(
            `INSERT INTO doctors (
        public_id,
        admin_id,
        name,
        qualifications,
        department,
        username,
        password,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'verified')
      RETURNING id, public_id, name`,
            [
                nanoid(12),
                adminId,
                toHyphenSlug(doctor.name),
                JSON.stringify(doctor.qualifications),
                toHyphenSlug(doctor.department),
                doctor.username,
                passwordHash,
            ]
        );

        const doctorRow = doctorResult.rows[0];
        doctorMap.set(doctor.key, doctorRow);

        await db.execute(
            `INSERT INTO users (public_id, doctor_id, role, username, password, status)
       VALUES (?, ?, 'doctor', ?, ?, 'verified')`,
            [nanoid(12), doctorRow.id, doctor.username, passwordHash]
        );

        for (const treatmentKey of doctor.treatments) {
            const treatment = treatmentMap.get(treatmentKey);
            if (!treatment) continue;

            await db.execute(
                `INSERT INTO doctor_treatments (public_id, admin_id, doctor_id, treatment_id)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(admin_id, doctor_id, treatment_id) DO NOTHING`,
                [nanoid(12), adminId, doctorRow.id, treatment.id]
            );
        }

        for (const template of doctor.templates) {
            await db.execute(
                `INSERT INTO weekly_templates (
          public_id,
          admin_id,
          doctor_id,
          day_number,
          start_time,
          end_time,
          break_start,
          break_end,
          buffer_minutes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(admin_id, doctor_id, day_number) DO NOTHING`,
                [
                    nanoid(12),
                    adminId,
                    doctorRow.id,
                    template.day_number,
                    template.start_time,
                    template.end_time,
                    template.break_start,
                    template.break_end,
                    template.buffer_minutes,
                ]
            );
        }
    }

    return doctorMap;
}

async function seedBookings({ adminId, branch, doctorMap, treatmentMap }) {
    let bookingCount = 0;
    let patientIndex = 0;
    const bookingStatuses = ["verified", "verified", "pending", "unverified", "cancelled", "revoked"];

    for (const doctor of branch.doctors) {
        const doctorRow = doctorMap.get(doctor.key);
        if (!doctorRow) continue;

        const usableTreatmentKey = doctor.treatments[0];
        const treatment = treatmentMap.get(usableTreatmentKey);
        if (!treatment) continue;

        const firstTemplate = doctor.templates[0];
        const secondTemplate = doctor.templates[1] || doctor.templates[0];
        const bookingDates = [
            nextDateForDayNumber(firstTemplate.day_number, 2),
            nextDateForDayNumber(secondTemplate.day_number, 5),
        ];

        const proposedBookings = [
            { date: bookingDates[0], start: firstTemplate.start_time + 30, status: bookingStatuses[bookingCount % bookingStatuses.length] },
            { date: bookingDates[1], start: secondTemplate.break_end + 30, status: bookingStatuses[(bookingCount + 1) % bookingStatuses.length] },
        ];

        for (const proposed of proposedBookings) {
            const patient = demoPatients[patientIndex % demoPatients.length];
            patientIndex += 1;

            const treatment_start = proposed.start;
            const treatment_end = proposed.start + treatment.duration;
            const parts = dateParts(proposed.date);

            await db.execute(
                `INSERT INTO bookings (
          public_id,
          admin_id,
          doctor_id,
          treatment_id,
          doctor_name,
          patient_name,
          patient_email,
          patient_phone,
          treatment_start,
          treatment_end,
          day_number,
          date_number,
          month_number,
          year,
          booking_date_iso,
          status,
          email_token_hash,
          email_token_created_at,
          cancel_token_hash,
          cancel_token_created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL)
        ON CONFLICT DO NOTHING`,
                [
                    nanoid(12),
                    adminId,
                    doctorRow.id,
                    treatment.id,
                    doctorRow.name,
                    patient.name,
                    patient.email,
                    patient.phone,
                    treatment_start,
                    treatment_end,
                    parts.day_number,
                    parts.date_number,
                    parts.month_number,
                    parts.year,
                    parts.booking_date_iso,
                    proposed.status,
                ]
            );

            bookingCount += 1;
        }
    }

    return bookingCount;
}

export async function mockDataInsersion({ resetExisting = false } = {}) {
    if (process.env.NODE_ENV === "production") {
        return {
            ok: false,
            message: "Refusing to seed demo data in production.",
        };
    }

    const existing = await db.execute(
        `SELECT id FROM admins WHERE admin_email LIKE ? LIMIT 1`,
        [`%@${DEMO_EMAIL_DOMAIN}`]
    );

    if (existing.rows.length > 0 && !resetExisting) {
        return {
            ok: true,
            skipped: true,
            message: "Demo data already exists. Pass { resetExisting: true } to recreate it.",
            credentials: {
                password: DEMO_PASSWORD,
                adminUsernames: demoBranches.map((branch) => branch.admin_username),
                doctorUsernames: demoBranches.flatMap((branch) => branch.doctors.map((doctor) => doctor.username)),
            },
        };
    }

    const deleted = resetExisting ? await deleteExistingDemoData() : { deletedBranches: 0 };
    const passwordHash = await hash(DEMO_PASSWORD);

    const summary = {
        branches: 0,
        doctors: 0,
        treatments: 0,
        templates: 0,
        bookings: 0,
        slotsGenerated: true,
    };

    for (const branch of demoBranches) {
        const admin = await seedAdmin({ branch, passwordHash });
        const treatmentMap = await seedTreatments({ adminId: admin.id, branch });
        const doctorMap = await seedDoctors({ adminId: admin.id, branch, passwordHash, treatmentMap });

        await rollingWindow(admin.id, 31);

        const bookingCount = await seedBookings({
            adminId: admin.id,
            branch,
            doctorMap,
            treatmentMap,
        });

        summary.branches += 1;
        summary.doctors += branch.doctors.length;
        summary.treatments += treatmentMap.size;
        summary.templates += branch.doctors.reduce((total, doctor) => total + doctor.templates.length, 0);
        summary.bookings += bookingCount;
    }

    return {
        ok: true,
        message: "Clinic demo data seeded successfully.",
        deleted,
        summary,
        credentials: {
            password: DEMO_PASSWORD,
            adminUsernames: demoBranches.map((branch) => branch.admin_username),
            doctorUsernames: demoBranches.flatMap((branch) => branch.doctors.map((doctor) => doctor.username)),
        },
    };
}
