"use server";

import { nanoid } from "nanoid";
import { db } from "@/app/lib/turso";
import { hashPassword } from "@/app/utils/hash";
import { resetDb, initAllTables } from "@/app/models/table-inits";

// ─── Hardcoded seed data ──────────────────────────────────────────────────────

const ADMIN = {
    username: "netadmin",
    password: "Admin@1234",
    email: "netadmin@netsol.pk",
};

const PLANS = [
    { speed: 5,  rate: 900  },
    { speed: 10, rate: 1800 },
    { speed: 25, rate: 3200 },
    { speed: 50, rate: 5500 },
];

// plan index maps to PLANS array above
const USERS = [
    { username: "ali_hassan",     contact: 3001234567, planIdx: 0 },
    { username: "muhammad_usman", contact: 3211234568, planIdx: 1 },
    { username: "bilal_ahmed",    contact: 3451234569, planIdx: 2 },
    { username: "hamza_khan",     contact: 3001234570, planIdx: 1 },
    { username: "zubair_malik",   contact: 3211234571, planIdx: 3 },
    { username: "tariq_mehmood",  contact: 3451234572, planIdx: 0 },
    { username: "kamran_akhtar",  contact: 3001234573, planIdx: 2 },
    { username: "asif_raza",      contact: 3211234574, planIdx: 1 },
    { username: "shahid_nawaz",   contact: 3451234575, planIdx: 0 },
    { username: "rizwan_hussain", contact: 3001234576, planIdx: 2 },
    { username: "imran_sheikh",   contact: 3211234577, planIdx: 1 },
    { username: "faisal_qureshi", contact: 3451234578, planIdx: 3 },
    { username: "nadeem_butt",    contact: 3001234579, planIdx: 0 },
    { username: "rabia_noor",     contact: 3001234582, planIdx: 1 },
];

// Billing history: Jan–Apr fully paid, May mixed statuses
const BILLING_MONTHS = [
    { month: 1, year: 2026 },
    { month: 2, year: 2026 },
    { month: 3, year: 2026 },
    { month: 4, year: 2026 },
    { month: 5, year: 2026 },
];

/**
 * Determines billing status for a given user index and month.
 * Jan–Apr: all paid. May: cycles through paid / unpaid / partial / paid.
 */
function resolveBillingStatus(userIdx, monthObj, amountDue) {
    if (monthObj.month < 5) {
        return { fee_status: "paid", amount_paid: amountDue, remaining_fee: 0 };
    }
    const cycle = userIdx % 4;
    if (cycle === 0) {
        return { fee_status: "paid",    amount_paid: amountDue,              remaining_fee: 0               };
    } else if (cycle === 1) {
        return { fee_status: "unpaid",  amount_paid: 0,                      remaining_fee: amountDue       };
    } else if (cycle === 2) {
        const paid = Math.floor(amountDue / 2);
        return { fee_status: "partial", amount_paid: paid,                   remaining_fee: amountDue - paid };
    } else {
        return { fee_status: "paid",    amount_paid: amountDue,              remaining_fee: 0               };
    }
}

// ─── Main seed function ───────────────────────────────────────────────────────

export async function seedDb() {
    try {
        // 1. Wipe everything
        const resetResult = await resetDb();
        if (!resetResult.ok) return resetResult;

        // 2. Re-create all tables
        const initResult = await initAllTables();
        if (!initResult.ok) return initResult;

        // 3. Insert admin
        const adminPublicId  = nanoid(12);
        const hashedAdminPass = hashPassword(ADMIN.password);

        const adminResult = await db.execute(
            `INSERT INTO admins (public_id, username, email, password) VALUES (?, ?, ?, ?)`,
            [adminPublicId, ADMIN.username, ADMIN.email, hashedAdminPass]
        );
        const adminId = Number(adminResult.lastInsertRowid);

        // 4. Insert plans and collect their DB ids
        const planIds = [];
        for (const plan of PLANS) {
            const result = await db.execute(
                `INSERT INTO plans (public_id, admin_id, speed, rate) VALUES (?, ?, ?, ?)`,
                [nanoid(12), adminId, plan.speed, plan.rate]
            );
            planIds.push(Number(result.lastInsertRowid));
        }

        // 5. Insert users
        const hashedUserPass = hashPassword("Pass@1234");
        const insertedUsers  = [];

        for (const u of USERS) {
            const userPublicId = nanoid(12);
            const plan         = PLANS[u.planIdx];
            const planDbId     = planIds[u.planIdx];

            const result = await db.execute(
                `INSERT INTO users (public_id, admin_id, username, password, contact, plan_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userPublicId, adminId, u.username, hashedUserPass, u.contact, planDbId]
            );

            insertedUsers.push({
                id:             Number(result.lastInsertRowid),
                public_id:      userPublicId,
                username:       u.username,
                contact:        u.contact,
                password:       hashedUserPass,
                plan_snapshot:  `${plan.speed}Mbps`,
                fee_snapshot:   `${plan.rate}Rs`,
                amount_due:     plan.rate,
            });
        }

        // 6. Insert billing transactions for each user × each month
        for (let i = 0; i < insertedUsers.length; i++) {
            const user = insertedUsers[i];

            for (const monthObj of BILLING_MONTHS) {
                const { fee_status, amount_paid, remaining_fee } =
                    resolveBillingStatus(i, monthObj, user.amount_due);

                await db.execute(
                    `INSERT OR IGNORE INTO billing_transactions
                        (public_id, user_id, admin_id, billing_month, billing_year,
                         fee_status, amount_due, amount_paid, remaining_fee,
                         plan_snapshot, fee_snapshot,
                         username_snapshot, contact_snapshot, password_snapshot)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        nanoid(16),
                        user.id,
                        adminId,
                        monthObj.month,
                        monthObj.year,
                        fee_status,
                        user.amount_due,
                        amount_paid,
                        remaining_fee,
                        user.plan_snapshot,
                        user.fee_snapshot,
                        user.username,
                        user.contact,
                        user.password,
                    ]
                );
            }
        }

        return {
            ok: true,
            message: `Seed complete — login: "${ADMIN.username}" / "${ADMIN.password}"`,
        };
    } catch (error) {
        console.error("[seedDb]", error);
        return { ok: false, message: `Seed failed: ${error.message}` };
    }
}