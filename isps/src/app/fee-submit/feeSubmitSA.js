'use server';

import { db } from "@/app/lib/turso";
import { updateRecords } from "@/app/lib/update-records";
import { initBilling_transactionsTable } from "@/app/models/table-inits";
import { nanoid } from "nanoid";
import { getUser } from "../lib/getUser";

export async function searchUser(_, searchTerm) {
    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, searchComplete: false, arr: [], message: "You must be logged in" };

    const adminId = currentUser.id;

    if (!searchTerm) return { ok: false, searchComplete: false, arr: [], message: "Search term is required" };
    try {

        const fetch = await db.execute(`
        SELECT public_id, username
        FROM users
        WHERE admin_id = ? AND username LIKE ?
        LIMIT 5
        `, [adminId, `%${searchTerm}%`]);

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
             AND username_snapshot = ?
             AND billing_month = ?
             AND billing_year = ?`,
            [userId, adminId, username, month, year]
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
            username: row.username_snapshot
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

    try {
        const record_public_id = formData.get("record_public_id");
        const username = formData.get("username");
        const paymentRaw = formData.get("payment");
        const payment = paymentRaw ? Number(paymentRaw) : 0;

        if (!record_public_id || !username) return { ok: false, message: "Search term is broken" };
        if (payment <= 0) return { ok: false, message: "Payment cannot be zero or negative" };

        const d = new Date();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const fetchUserId = await db.execute(`
            SELECT amount_due, remaining_fee FROM billing_transactions
            WHERE public_id = ? AND admin_id = ? AND username_snapshot = ? AND billing_month = ? AND billing_year = ?
        `, [record_public_id, adminId, username, month, year]);

        if (fetchUserId.rows.length === 0) return { ok: false, message: "update records in settings" };

        const amount_due = fetchUserId.rows[0].amount_due;
        const remaining_fee = fetchUserId.rows[0].remaining_fee;

        const remainingFee = remaining_fee - payment;
        const feeStatus = remainingFee <= 0 ? "paid" : (remainingFee === amount_due ? "unpaid" : "partial");
        const amount_paid = amount_due - remainingFee;

        const invoiceId = `${month}${year}-${record_public_id}${nanoid(8)}`;

        const update = await db.execute(`
            UPDATE billing_transactions
            SET fee_status = ?, amount_paid = ?, remaining_fee = ?, invoice_id = ?
            WHERE public_id = ? AND admin_id = ? AND username_snapshot = ? AND billing_month = ? AND billing_year = ?
        `, [feeStatus, amount_paid, remainingFee, invoiceId, record_public_id, adminId, username, month, year]);

        return { ok: true, message: "Payment submitted", invoiceId, submitComplete: true };


    } catch (error) {
        console.log(error);
        return { ok: false, message: "Database error." };
    }


}
