'use server';

import { db } from "@/app/lib/turso";
import { initBilling_transactionsTable } from "@/app/models/table-inits";
import { nanoid } from "nanoid";

export async function searchUserAction(_, formData) {
    const query = typeof formData === 'string' ? formData : formData.get('term');

    if (!query) return { ok: false, searchComplete: false, arr: [], message: "Query is required" };

    try {
        const res = await db.execute(
            "SELECT public_id, username FROM users WHERE username LIKE ? LIMIT 5",
            [`%${query}%`]
        );

        if (res.rows.length === 0) {
            return { ok: false, searchComplete: true, arr: [], message: "No user found" };
        }

        const arr = res.rows.map((user) => ({
            public_id: user.public_id,
            username: user.username,
        }));

        return { ok: true, searchComplete: true, arr, message: "Search completed" };
    } catch {
        return { ok: false, searchComplete: false, arr: [], message: "Database error." };
    }
}

export async function fetchUserDetails(_, formData) {
    try {
        const user_public_id = formData?.get('public_id');
        const user_username = formData?.get('username');

        if (!user_public_id || !user_username) {
            return {
                ok: false,
                username: null,
                contact: null,
                plan: null,
                rate: null,
                fee_status: null,
                remaining_fee: null,
                invoiceId: null,
                message: "Missing fields",
            };
        }

        await initBilling_transactionsTable();

        const d = new Date();
        const billingMonth = d.getMonth() + 1;
        const billingYear = d.getFullYear();

        const billingRes = await db.execute(
            "SELECT * FROM billing_transactions WHERE username_snapshot = ? AND billing_month = ? AND billing_year = ?",
            [user_username, billingMonth, billingYear]
        );

        if (billingRes.rows.length > 0) {
            const row = billingRes.rows[0];
            const isPaid = row.remaining_fee === 0;
            return {
                ok: true,
                username: user_username,
                contact: null,
                plan: row.plan_snapshot,
                rate: row.rate_snapshot,
                fee_status: isPaid ? 'paid' : 'partial',
                remaining_fee: row.remaining_fee,
                invoiceId: row.invoice_id,
                message: isPaid
                    ? "Fee has been paid for this month."
                    : `Partial payment recorded. Remaining fee: ${row.remaining_fee}`,
            };
        }

        const userRes = await db.execute(
            `SELECT
                plans.speed AS plan,
                plans.rate AS rate,
                users.contact AS contact
            FROM users
            LEFT JOIN user_plans ON users.id = user_plans.user_id
            LEFT JOIN plans ON user_plans.plan_id = plans.id
            WHERE users.public_id = ? AND users.username = ?`,
            [user_public_id, user_username]
        );

        if (!userRes.rows.length || userRes.rows[0].plan === null) {
            return {
                ok: false,
                username: null,
                contact: null,
                plan: null,
                rate: null,
                fee_status: null,
                remaining_fee: null,
                invoiceId: null,
                message: "User has no active plan. Please subscribe first.",
            };
        }

        return {
            ok: true,
            username: user_username,
            public_id: user_public_id,
            contact: userRes.rows[0].contact,
            plan: userRes.rows[0].plan,
            rate: userRes.rows[0].rate,
            fee_status: 'unpaid',
            remaining_fee: null,
            invoiceId: null,
            message: "User details fetched",
        };
    } catch {
        return {
            ok: false,
            username: null,
            contact: null,
            plan: null,
            rate: null,
            fee_status: null,
            remaining_fee: null,
            invoiceId: null,
            message: "Something went wrong. Please try again.",
        };
    }
}

export async function submitAction(_, formData) {
    try {
        const user_public_id = formData?.get('public_id');
        const user_username = formData?.get('username');
        const fee_paid = Number(formData?.get('fee_paid') ?? 0);

        if (!user_public_id || !user_username) {
            return { ok: false, message: "Missing fields" };
        }

        const userRes = await db.execute(
            `SELECT
                plans.speed AS plan,
                plans.rate AS rate,
                users.contact AS contact
            FROM users
            LEFT JOIN user_plans ON users.id = user_plans.user_id
            LEFT JOIN plans ON user_plans.plan_id = plans.id
            WHERE users.public_id = ? AND users.username = ?`,
            [user_public_id, user_username]
        );

        if (!userRes.rows.length) {
            return { ok: false, message: "User not found" };
        }

        const { plan, rate, contact } = userRes.rows[0];

        const feeStatus = fee_paid >= rate ? 'paid' : fee_paid > 0 ? 'partial' : 'unpaid';

        const d = new Date();
        const billingMonth = d.getMonth() + 1;
        const billingYear = d.getFullYear();
        const remainingFee = Math.max(0, rate - fee_paid);
        const invoiceId = `${billingMonth}${billingYear}-${nanoid(10)}`;

        const insertResult = await db.execute(
            `INSERT INTO billing_transactions (
                public_id, admin_id, plan_snapshot, billing_month, billing_year,
                fee_status, amount_due, amount_paid, remaining_fee,
                fee_snapshot, username_snapshot, invoice_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nanoid(12),
                1,
                `${plan}Mbps`,
                billingMonth,
                billingYear,
                feeStatus,
                rate,
                fee_paid,
                remainingFee,
                `${fee_paid}Rs`,
                user_username,
                invoiceId,
            ]
        );

        if (insertResult.rowsAffected === 0) {
            return { ok: false, message: "Failed to insert record" };
        }

        return {
            ok: true,
            username: user_username,
            contact,
            plan,
            rate,
            fee_status: feeStatus,
            remaining_fee: remainingFee,
            invoiceId,
            message: "Entry added to billing records.",
        };
    } catch {
        return { ok: false, message: "Something went wrong." };
    }
}