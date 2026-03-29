'use server';

import { db } from "@/app/lib/turso";
import { initBilling_transactionsTable } from "@/app/models/table-inits";
import { nanoid } from "nanoid";

export async function searchUserAction(_, formData) {
    const query = typeof formData === 'string' ? formData : formData.get('term');
    if (!query) return { ok: false, searchComplete: false, arr: [], message: "Query is required" };

    try {
        const res = await db.execute("SELECT public_id, username FROM users WHERE username LIKE ? LIMIT 5", [`%${query}%`]);

        if (res.rows.length === 0) {
            return { ok: false, searchComplete: true, arr: [], message: "No user found" };
        }

        const arr = res.rows.map(user => ({
            public_id: user.public_id,
            username: user.username
        }));

        return { ok: true, searchComplete: true, arr, message: "Search completed" };
    } catch (error) {
        return { ok: false, searchComplete: false, arr: [], message: "Database error." };
    }
}

export async function fetchUserDetails(_, formData) {
    try {
        const user_public_id = formData?.get('public_id');
        const user_username = formData?.get('username');

        if (!user_public_id || !user_username) {
            return { ok: false, searchComplete: false, username: null, contact: null, plan: null, rate: null, fee_status: null, remaining_fee: null, message: "Missing fields" };
        }

        await initBilling_transactionsTable();
        const d = new Date();
        const billingMonth = d.getMonth() + 1;
        const billingYear = d.getFullYear();

        const fetchBillingDetails = await db.execute(
            "SELECT * FROM billing_transactions WHERE username_snapshot = ? AND billing_month = ? AND billing_year = ?",
            [user_username, billingMonth, billingYear]
        );

        if (fetchBillingDetails.rows.length > 0) {
            const row = fetchBillingDetails.rows[0];
            const isPaid = row.remaining_fee === 0;
            return {
                ok: true,
                searchComplete: true,
                username: user_username,
                contact: null,
                plan: row.plan_snapshot,
                rate: row.rate_snapshot,
                fee_status: isPaid ? 'paid' : 'partial',
                remaining_fee: row.remaining_fee,
                invoiceId: row.invoice_id,
                message: isPaid ? "fee has been paid for this month" : `fee has been paid for this month. Remaining fee is ${row.remaining_fee}`
            };
        }

        const userRes = await db.execute(`
                SELECT 
                plans.speed AS plan,
                plans.rate AS rate,
                users.contact AS contact
                FROM users
                LEFT JOIN user_plans ON users.id = user_plans.user_id
                LEFT JOIN plans ON user_plans.plan_id = plans.id
                WHERE users.public_id = ? AND users.username = ?`,
            [user_public_id, user_username]);

        if (!userRes.rows.length) {
            return {
                ok: false,
                searchComplete: true,
                username: null,
                contact: null,
                plan: null,
                rate: null,
                fee_status: null,
                remaining_fee: null,
                invoiceId: null,
                message: "something went wrong. User might not exist."
            };
        }

        return {
            ok: true,
            searchComplete: true,
            username: user_username,
            public_id: user_public_id,
            contact: userRes.rows[0].contact,
            plan: userRes.rows[0].plan,
            rate: userRes.rows[0].rate,
            fee_status: 'unpaid',
            remaining_fee: null,
            invoiceId: null,
            message: "User details fetched"
        };

    } catch (error) {
        return {
            ok: false,
            searchComplete: false,
            username: null,
            contact: null,
            plan: null,
            rate: null,
            fee_status: null,
            remaining_fee: null,
            invoiceId: null,
            message: "something went wrong. Please try again"
        };
    }
}

export async function submitAction(_, formData) {
    try {
        const user_public_id = formData?.get('public_id');
        const user_username = formData?.get('username');
        const fee_paid_Raw = formData?.get('fee_paid');
        const fee_paid = fee_paid_Raw ? Number(fee_paid_Raw) : 0;

        if (!user_public_id || !user_username) {
            return { ok: false, message: "Missing fields" };
        }

        const userRes = await db.execute(`
                SELECT 
                plans.speed AS plan,
                plans.rate AS rate,
                users.contact AS contact
                FROM users
                LEFT JOIN user_plans ON users.id = user_plans.user_id
                LEFT JOIN plans ON user_plans.plan_id = plans.id
                WHERE users.public_id = ? AND users.username = ?`,
            [user_public_id, user_username]);

        if (!userRes.rows.length) {
            return { ok: false, message: "User not found" };
        }

        const plan = userRes.rows[0].plan;
        const rate = userRes.rows[0].rate;

        let feeIs = 'unpaid';
        if (fee_paid > 0 && fee_paid < rate) feeIs = 'partial';
        if (fee_paid >= rate) feeIs = 'paid';

        const d = new Date();
        const newPublicId = nanoid(12);
        const adminId = 1; // hardcoded temporarily
        const planSnapshot = `${plan}Mbps`;
        const billingMonth = d.getMonth() + 1;
        const billingYear = d.getFullYear();
        const amountDue = rate;
        const remainingFee = rate - fee_paid;
        const feeSnapshot = `${fee_paid}Rs`;
        const invoiceId = `${billingMonth}${billingYear}-${nanoid(10)}`;

        const insertResult = await db.execute(`
            INSERT INTO billing_transactions (
            public_id, admin_id, plan_snapshot, billing_month, billing_year, 
            fee_status, amount_due, amount_paid, remaining_fee, 
            fee_snapshot, username_snapshot, invoice_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newPublicId, adminId, planSnapshot, billingMonth, billingYear, feeIs, amountDue, fee_paid, remainingFee, feeSnapshot, user_username, invoiceId]
        );

        if (insertResult.rowsAffected === 0) {
            return { ok: false, message: "Failed to insert record" };
        }

        return {
            ok: true,
            username: user_username,
            contact: userRes.rows[0].contact,
            plan: plan,
            rate: rate,
            fee_status: feeIs,
            remaining_fee: remainingFee,
            invoiceId,
            message: "entry added into billing records"
        };

    } catch (error) {
        return { ok: false, message: "something went wrong" };
    }
}