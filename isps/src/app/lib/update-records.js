"use server";

import { nanoid } from "nanoid";
import { db } from "./turso";
import { initBilling_transactionsTable } from "../models/table-inits";

export async function updateRecords() {
    try {
        const adminId = 1;

        await initBilling_transactionsTable();

        const result = await db.execute(
            `
                SELECT users.id AS user_id,
                users.public_id AS user_public_id,
                users.admin_id,
                users.username,
                users.contact,
                users.password,
                COALESCE(plans.speed, 2) AS plan,
                COALESCE(plans.rate, 500) AS fee
                FROM users
                LEFT JOIN user_plans ON users.id = user_plans.user_id
                LEFT JOIN plans ON user_plans.plan_id = plans.id
                WHERE users.admin_id = ?
                `,
            [adminId]
        );

        if (!result.rows.length) return { ok: false, message: "No records found" };

        const d = new Date();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        const parameters = "(public_id, user_id, admin_id, billing_month, billing_year, amount_due, plan_snapshot, fee_snapshot, username_snapshot, contact_snapshot, password_snapshot, remaining_fee)";

        const placeHolders = result.rows.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");

        const VALUES = [];

        for (const userObj of result.rows) {
            const public_id = nanoid(16);
            const user_id = userObj.user_id;
            const admin_id = userObj.admin_id;
            const amount_due = userObj.fee || 0;
            const plan_snapshot = userObj.plan ? `${userObj.plan}Mbps` : null;
            const fee_snapshot = userObj.fee ? `${userObj.fee}Rs` : null;
            const username_snapshot = userObj.username;
            const contact_snapshot = userObj.contact;
            const password_snapshot = userObj.password ? userObj.password : null;
            const remaining_fee = amount_due;

            VALUES.push(
                public_id,
                user_id,
                admin_id,
                month,
                year,
                amount_due,
                plan_snapshot,
                fee_snapshot,
                username_snapshot,
                contact_snapshot,
                password_snapshot,
                remaining_fee
            );
        }

        await db.execute(
            `
            INSERT INTO billing_transactions ${parameters}
            VALUES ${placeHolders} ON CONFLICT (user_id, billing_month, billing_year) DO NOTHING
            `,
            VALUES
        );

        return { ok: true, message: "Records updated successfully" };
    } catch (error) {
        console.error(error);
        return { ok: false, message: "Error updating records" };
    }
}