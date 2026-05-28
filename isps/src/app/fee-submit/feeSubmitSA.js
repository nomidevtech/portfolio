'use server';

import { db } from "@/app/lib/turso";
import { updateRecords } from "@/app/lib/update-records";
import { initBilling_transactionsTable } from "@/app/models/table-inits";
import { nanoid } from "nanoid";
import { getUser } from "../lib/getUser";
import { redisIpLimit } from "@/app/utils/redidIpLimit";

export async function searchUser(_, searchTerm) {
    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, searchComplete: false, arr: [], message: "You must be logged in" };

    const adminId = currentUser.id;

    const term = searchTerm?.toString().trim();

    if (!term || term.length < 2) {
        return {
            ok: false,
            searchComplete: false,
            arr: [],
            message: "Enter at least 2 characters",
        };
    }
    try {

        const fetch = await db.execute(`
        SELECT public_id, username
        FROM users
        WHERE admin_id = ? AND username LIKE ?
        LIMIT 5
        `, [adminId, `%${term}%`]);

        if (fetch.rows.length === 0) return { ok: false, searchComplete: true, arr: [], message: "No user found" };

        const arr = fetch.rows.map(user => ({
            public_id: user.public_id,
            username: user.username
        }));

        return { ok: true, searchComplete: true, arr, message: "Search completed" };

    } catch (error) {
        console.error(error);
        return { ok: false, searchComplete: false, arr: [], message: "Database error." };
    }

}



export async function fetchDetails(_, formData) {
    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, searchComplete: false, arr: [], message: "You must be logged in" };

    const adminId = currentUser.id;

    try {
        if (!formData) {
            return { ok: false, message: "Search term is broken" };
        }

        await updateRecords();

        const user_public_id = formData.get("user_public_id");
        const username = formData.get("username");

        const fetchUserId = await db.execute(
            "SELECT id FROM users WHERE admin_id = ? AND public_id = ?",
            [adminId, user_public_id]
        );

        const userId = fetchUserId?.rows?.[0]?.id;

        if (!userId) {
            return { ok: false, searchComplete: false, message: "User details conflict" };
        }

        const d = new Date();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const columns =
            "public_id, fee_status, amount_due, remaining_fee, plan_snapshot, contact_snapshot, username_snapshot";


        const fetchCurrentMonthRecord = await db.execute(
            `SELECT ${columns}
             FROM billing_transactions
             WHERE user_id = ?
             AND admin_id = ?
             AND billing_month = ?
             AND billing_year = ?`,
            [userId, adminId, month, year]
        );

        const row = fetchCurrentMonthRecord?.rows?.[0];

        if (!row) {
            return {
                ok: false,
                searchComplete: false,
                message: "update records in settings"
            };
        }

        const payload = {
            record_public_id: row.public_id,
            fee_status: row.fee_status,
            amount_due: row.amount_due,
            remaining_fee: row.remaining_fee,
            plan: row.plan_snapshot,
            contact: row.contact_snapshot,
            username: username
        };


        return { ok: true, searchComplete: true, ...payload, message: "Search completed" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Database error." };
    }
}




export async function submit(_, formData) {
    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, searchComplete: false, arr: [], message: "You must be logged in" };

    const adminId = currentUser.id;

    const ipLimit = await redisIpLimit(20, "fee_submit");
    if (!ipLimit.ok) return ipLimit;

    try {
        const record_public_id = formData.get("record_public_id");
        const username = formData.get("username");
        const paymentRaw = formData.get("payment");
        const payment = Number(paymentRaw);

        if (!record_public_id || !username) {
            return {
                ok: false,
                submitComplete: false,
                message: "Search term is broken",
            };
        }

        if (!Number.isFinite(payment) || payment <= 0) {
            return {
                ok: false,
                submitComplete: false,
                message: "Payment must be a valid positive number",
            };
        }

        const d = new Date();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const fetchUserId = await db.execute(`
            SELECT amount_due, remaining_fee, billing_month, billing_year FROM billing_transactions
            WHERE public_id = ? AND admin_id = ?
        `, [record_public_id, adminId]);

        if (fetchUserId.rows.length === 0) {
            return {
                ok: false,
                submitComplete: false,
                message: "Billing record not found",
            };
        }

        const amount_due = fetchUserId.rows[0].amount_due;
        const remaining_fee = Number(fetchUserId.rows[0].remaining_fee);
        const record_month = fetchUserId.rows[0].billing_month;
        const record_year = fetchUserId.rows[0].billing_year;

        if (!Number.isFinite(remaining_fee) || remaining_fee < 0) {
            return {
                ok: false,
                submitComplete: false,
                message: "Invalid billing record",
            };
        }

        if (payment > remaining_fee) {
            return {
                ok: false,
                submitComplete: false,
                message: "Payment cannot exceed remaining fee",
            };
        }

        const remainingFee = remaining_fee - payment;
        const feeStatus = remainingFee <= 0 ? "paid" : (remainingFee === amount_due ? "unpaid" : "partial");
        const amount_paid = amount_due - remainingFee;

        const invoiceId = `${record_month}${record_year}-${record_public_id}${nanoid(8)}`;

        const update = await db.execute(`
            UPDATE billing_transactions
            SET fee_status = ?, amount_paid = ?, remaining_fee = ?, invoice_id = ?, last_updated = CURRENT_TIMESTAMP
            WHERE public_id = ? AND admin_id = ?
        `, [feeStatus, amount_paid, remainingFee, invoiceId, record_public_id, adminId]);

        if (update.rowsAffected === 0) {
            return {
                ok: false,
                submitComplete: false,
                message: "Payment could not be submitted",
            };
        }

        return { ok: true, message: "Payment submitted", invoiceId, submitComplete: true };

    } catch (error) {
        console.log(error);
        return { ok: false, submitComplete: false, message: "Database error." };
    }
}
