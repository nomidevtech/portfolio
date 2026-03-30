'use server';

import { db } from "@/app/lib/turso";
import { updateRecords } from "@/app/lib/update-records";

export async function searchUser(_, searchTerm) {
    if (!searchTerm || searchTerm.trim() === "") {
        return { ok: false, searchComplete: false, arr: [], message: "" };
    }

    try {
        const fetch = await db.execute(`
            SELECT public_id, username
            FROM users
            WHERE username LIKE ?
            LIMIT 5
        `, [`%${searchTerm}%`]);

        if (fetch.rows.length === 0) {
            return { ok: false, searchComplete: true, arr: [], message: "No user found" };
        }

        const arr = fetch.rows.map(user => ({
            public_id: user.public_id,
            username: user.username
        }));

        return { ok: true, searchComplete: true, arr, message: "Search completed" };
    } catch (error) {
        return { ok: false, searchComplete: false, arr: [], message: "Database error." };
    }
}

export async function fetchDetails(prevState, formData) {
    try {

        await updateRecords();

        if (!formData) return { ok: false, message: "Invalid Request" };

        const payment = formData.get("payment");
        const record_public_id = formData.get("record_public_id");

        if (payment !== null && record_public_id) {
            const payVal = parseFloat(payment);
            const currentRecord = await db.execute(
                "SELECT remaining_fee FROM billing_transactions WHERE public_id = ?",
                [record_public_id]
            );

            if (!currentRecord.rows.length) return { ok: false, message: "Record not found" };

            const newRemaining = Math.max(0, currentRecord.rows[0].remaining_fee - payVal);
            const newStatus = newRemaining <= 0 ? "paid" : "partial";

            await db.execute(
                "UPDATE billing_transactions SET remaining_fee = ?, fee_status = ? WHERE public_id = ?",
                [newRemaining, newStatus, record_public_id]
            );
        }

        const user_public_id = formData.get("public_id") || prevState?.user_public_id;
        const username = formData.get("username") || prevState?.username;
        const active_record_id = record_public_id || prevState?.record_public_id;

        let row;
        if (active_record_id) {
            const fetchByRecord = await db.execute(
                `SELECT public_id, fee_status, amount_due, remaining_fee, plan_snapshot, contact_snapshot, username_snapshot 
                 FROM billing_transactions WHERE public_id = ?`,
                [active_record_id]
            );
            row = fetchByRecord.rows[0];
        } else {
            const fetchUserId = await db.execute("SELECT id FROM users WHERE public_id = ?", [user_public_id]);
            const userId = fetchUserId?.rows?.[0]?.id;

            if (!userId) return { ok: false, searchComplete: true, message: "User not found" };

            const d = new Date();
            const month = d.getMonth() + 1;
            const year = d.getFullYear();

            const fetchCurrent = await db.execute(
                `SELECT public_id, fee_status, amount_due, remaining_fee, plan_snapshot, contact_snapshot, username_snapshot
                 FROM billing_transactions
                 WHERE user_id = ? AND billing_month = ? AND billing_year = ?`,
                [userId, month, year]
            );
            row = fetchCurrent.rows[0];
        }

        if (!row) return { ok: false, searchComplete: true, message: "Update records in settings" };

        return {
            ok: true,
            searchComplete: true,
            user_public_id,
            record_public_id: row.public_id,
            fee_status: row.fee_status,
            amount_due: row.amount_due,
            remaining_fee: row.remaining_fee,
            plan: row.plan_snapshot,
            contact: row.contact_snapshot,
            username: row.username_snapshot,
            message: payment ? "Payment Updated" : "Details Loaded"
        };
    } catch (error) {
        return { ok: false, message: "Database error." };
    }
}