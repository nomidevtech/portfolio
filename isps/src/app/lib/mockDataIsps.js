"use server";

import { nanoid } from "nanoid";
import { db } from "@/app/lib/turso";
import { hashPassword } from "@/app/utils/hash";
import {
    initAdminsTable,
    initPlansTable,
    initUsersTable,
    initBilling_transactionsTable,
} from "@/app/models/table-inits";

// ─── Seed Config ────────────────────────────────────────────────────────────

const ADMIN = {
    username: "netadmin",
    password: "Admin@1234",      // use this to log in during demo
    email: "netadmin@netsol.pk",
};

const PLANS = [
    { speed: 5, rate: 1000, label: "Basic" },
    { speed: 10, rate: 1800, label: "Standard" },
    { speed: 20, rate: 3000, label: "Premium" },
    { speed: 50, rate: 5500, label: "Ultra" },
];

// 16 subscribers — realistic Lahore names + 03xx contacts
const USERS = [
    { username: "ali_hassan", contact: 3001234567, plan: 1 },  // Standard
    { username: "muhammad_usman", contact: 3211234568, plan: 0 },  // Basic
    { username: "bilal_ahmed", contact: 3451234569, plan: 2 },  // Premium
    { username: "hamza_khan", contact: 3001234570, plan: 1 },  // Standard
    { username: "zubair_malik", contact: 3211234571, plan: 3 },  // Ultra
    { username: "tariq_mehmood", contact: 3451234572, plan: 0 },  // Basic
    { username: "kamran_akhtar", contact: 3001234573, plan: 2 },  // Premium
    { username: "asif_raza", contact: 3211234574, plan: 1 },  // Standard
    { username: "shahid_nawaz", contact: 3451234575, plan: 0 },  // Basic
    { username: "rizwan_hussain", contact: 3001234576, plan: 2 },  // Premium
    { username: "imran_sheikh", contact: 3211234577, plan: 1 },  // Standard
    { username: "faisal_qureshi", contact: 3451234578, plan: 3 },  // Ultra
    { username: "nadeem_butt", contact: 3001234579, plan: 0 },  // Basic
    { username: "khalid_mahmood", contact: 3211234580, plan: 1 },  // Standard
    { username: "sajid_iqbal", contact: 3451234581, plan: 2 },  // Premium
    { username: "rabia_noor", contact: 3001234582, plan: 1 },  // Standard
];

// ─── Billing helpers ─────────────────────────────────────────────────────────

// months we want history for (past 4 + current)
const BILLING_MONTHS = [
    { month: 1, year: 2026 },
    { month: 2, year: 2026 },
    { month: 3, year: 2026 },
    { month: 4, year: 2026 },
    { month: 5, year: 2026 },   // current — mixed statuses
];

/**
 * Decide fee_status, amount_paid, remaining_fee for a given user index + month.
 * Past months  → always paid in full.
 * Current month→ rotate paid / partial / unpaid so the dashboard looks active.
 */
function billingStatus(userIndex, monthObj, amountDue) {
    if (monthObj.month < 5) {
        // all past months fully paid
        return { fee_status: "paid", amount_paid: amountDue, remaining_fee: 0 };
    }
    // current month — cycle through statuses
    const cycle = userIndex % 4;
    if (cycle === 0) {
        return { fee_status: "paid", amount_paid: amountDue, remaining_fee: 0 };
    } else if (cycle === 1) {
        return { fee_status: "unpaid", amount_paid: 0, remaining_fee: amountDue };
    } else if (cycle === 2) {
        const paid = Math.floor(amountDue / 2);
        return { fee_status: "partial", amount_paid: paid, remaining_fee: amountDue - paid };
    } else {
        return { fee_status: "paid", amount_paid: amountDue, remaining_fee: 0 };
    }
}

// ─── Main seed function ───────────────────────────────────────────────────────

export async function seedDummyData() {
    try {
        // 1. Ensure all tables exist
        await initAdminsTable();
        await initPlansTable();
        await initUsersTable();
        await initBilling_transactionsTable();

        // 2. Guard — skip if this seed admin already exists
        const existing = await db.execute(
            "SELECT id FROM admins WHERE username = ?",
            [ADMIN.username]
        );
        if (existing.rows.length > 0) {
            return { ok: false, message: "Dummy data already seeded. Nothing inserted." };
        }

        // ── Insert admin ──────────────────────────────────────────────────────
        const adminPublicId = nanoid(12);
        const hashedAdminPass = hashPassword(ADMIN.password);

        const adminResult = await db.execute(
            `INSERT INTO admins (public_id, username, email, password)
             VALUES (?, ?, ?, ?)`,
            [adminPublicId, ADMIN.username, ADMIN.email, hashedAdminPass]
        );
        const adminId = Number(adminResult.lastInsertRowid);

        // ── Insert plans ──────────────────────────────────────────────────────
        const insertedPlanIds = [];
        for (const plan of PLANS) {
            const planResult = await db.execute(
                `INSERT INTO plans (public_id, admin_id, speed, rate)
                 VALUES (?, ?, ?, ?)`,
                [nanoid(12), adminId, plan.speed, plan.rate]
            );
            insertedPlanIds.push(Number(planResult.lastInsertRowid));
        }

        // ── Insert users ──────────────────────────────────────────────────────
        const insertedUsers = [];
        for (const u of USERS) {
            const userPublicId = nanoid(12);
            const hashedUserPass = hashPassword("Pass@1234"); // generic demo password
            const planId = insertedPlanIds[u.plan];
            const planRate = PLANS[u.plan].rate;
            const planSpeed = PLANS[u.plan].speed;

            const userResult = await db.execute(
                `INSERT INTO users (public_id, admin_id, username, password, contact, plan_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userPublicId, adminId, u.username, hashedUserPass, u.contact, planId]
            );

            insertedUsers.push({
                id: Number(userResult.lastInsertRowid),
                public_id: userPublicId,
                username: u.username,
                contact: u.contact,
                password: hashedUserPass,
                plan_speed: planSpeed,
                plan_rate: planRate,
                plan_snapshot: `${planSpeed}Mbps`,
                fee_snapshot: `${planRate}Rs`,
            });
        }

        // ── Insert billing transactions ───────────────────────────────────────
        for (let i = 0; i < insertedUsers.length; i++) {
            const user = insertedUsers[i];
            for (const monthObj of BILLING_MONTHS) {
                const { fee_status, amount_paid, remaining_fee } =
                    billingStatus(i, monthObj, user.plan_rate);

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
                        user.plan_rate,
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
            message: `Seed complete — admin: "${ADMIN.username}" / password: "${ADMIN.password}"`,
        };
    } catch (error) {
        console.error("[seedDummyData]", error);
        return { ok: false, message: `Seed failed: ${error.message}` };
    }
}