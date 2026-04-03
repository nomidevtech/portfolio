"use server";

import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";

export async function fetchStatsServerAction(_, formData) {

    const currentUser = await getUser();
    if (!currentUser?.id) return { ok: false, searchComplete: false, stats: {}, message: "You must be logged in" };

    const defaultStats = {
        numberOfUsers: 0,
        totalRevenue: 0,
        recovery: 0,
        pending: 0,
        unpaid: 0,
        partial: 0,
        paid: 0,
    };

    try {
        const monthRaw = formData.get("month")?.toLowerCase().trim();
        const yearRaw = formData.get("year");

        if (!monthRaw || !yearRaw) {
            return { ok: false, searchComplete: false, stats: defaultStats, message: "Month and year are required" };
        }

        const monthsObj = [
            ["jan", 1], ["feb", 2], ["mar", 3], ["apr", 4],
            ["may", 5], ["jun", 6], ["jul", 7], ["aug", 8],
            ["sep", 9], ["oct", 10], ["nov", 11], ["dec", 12]
        ];

        const month = monthsObj.find(m => monthRaw?.startsWith(m[0]))?.[1] || null;
        const year = Number(yearRaw) || null;
        const adminId = currentUser.id;

        const fetchStats = await db.execute(
            `SELECT COUNT(*) AS total_users, SUM(amount_due) AS total_revenue, SUM(amount_paid) AS recovery, SUM(remaining_fee) AS pending 
             FROM billing_transactions WHERE admin_id = ? AND (billing_month = ? AND billing_year = ? AND user_id IS NOT NULL)`,
            [adminId, month, year]
        );

        const fetchUsers = await db.execute(
            `SELECT username_snapshot AS username, amount_due, amount_paid, remaining_fee, fee_status FROM billing_transactions WHERE admin_id = ? AND user_id IS NOT NULL AND billing_month = ? AND billing_year = ?`,
            [adminId, month, year]
        );

        const paidUsers = [];
        const partialUsers = [];
        const unpaidUsers = [];

        if (fetchUsers.rows.length > 0) {
            fetchUsers.rows.forEach(row => {
                if (row.fee_status === "paid") paidUsers.push({ username: row.username, amount_due: row.amount_due, amount_paid: row.amount_paid, remaining_fee: row.remaining_fee });
                if (row.fee_status === "partial") partialUsers.push({ username: row.username, amount_due: row.amount_due, amount_paid: row.amount_paid, remaining_fee: row.remaining_fee });
                if (row.fee_status === "unpaid") unpaidUsers.push({ username: row.username, amount_due: row.amount_due, amount_paid: row.amount_paid, remaining_fee: row.remaining_fee });
            });
        }

        const usersByFeeStatus = {
            paid: paidUsers,
            partial: partialUsers,
            unpaid: unpaidUsers
        };

        if (!fetchStats.rows.length || fetchStats.rows[0].total_users === 0) {
            return { ok: false, searchComplete: true, stats: defaultStats, message: "No records found for this period" };
        }

        const fetchStatus = await db.execute(
            `SELECT fee_status, COUNT(*) AS count FROM billing_transactions 
             WHERE admin_id = ? AND user_id IS NOT NULL AND (billing_month = ? AND billing_year = ?) GROUP BY fee_status`,
            [adminId, month, year]
        );

        const stats = {
            numberOfUsers: fetchStats.rows[0].total_users || 0,
            totalRevenue: fetchStats.rows[0].total_revenue || 0,
            recovery: fetchStats.rows[0].recovery || 0,
            pending: fetchStats.rows[0].pending || 0,
            unpaid: 0,
            partial: 0,
            paid: 0
        };

        fetchStatus.rows.forEach(row => {
            if (row.fee_status === "unpaid") stats.unpaid = row.count || 0;
            if (row.fee_status === "partial") stats.partial = row.count || 0;
            if (row.fee_status === "paid") stats.paid = row.count || 0;
        });

        return { ok: true, searchComplete: true, stats, usersByFeeStatus, message: "" };

    } catch (error) {
        console.error("Action Error:", error);
        return { ok: false, searchComplete: false, stats: defaultStats, message: "Database error." };
    }
}









