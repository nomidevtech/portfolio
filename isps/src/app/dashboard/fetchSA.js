"use server";

import { db } from "../lib/turso";

export async function fetchStatsServerAction(_, formData) {
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
        const adminId = 1;

        const fetchStats = await db.execute(
            `SELECT COUNT(*) AS total_users, SUM(amount_due) AS total_revenue, SUM(amount_paid) AS recovery, SUM(remaining_fee) AS pending 
             FROM billing_transactions WHERE admin_id = ? AND (billing_month = ? AND billing_year = ?)`,
            [adminId, month, year]
        );

        if (!fetchStats.rows.length || fetchStats.rows[0].total_users === 0) {
            return { ok: false, searchComplete: true, stats: defaultStats, message: "No records found for this period" };
        }

        const fetchStatus = await db.execute(
            `SELECT fee_status, COUNT(*) AS count FROM billing_transactions 
             WHERE admin_id = ? AND (billing_month = ? AND billing_year = ?) GROUP BY fee_status`,
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

        return { ok: true, searchComplete: true, stats, message: "" };

    } catch (error) {
        console.error("Action Error:", error);
        return { ok: false, searchComplete: false, stats: defaultStats, message: "Database error." };
    }
}