"use server";

import { db } from "../lib/turso";

const MONTHS = [
  ["jan", 1], ["feb", 2], ["mar", 3], ["apr", 4],
  ["may", 5], ["jun", 6], ["jul", 7], ["aug", 8],
  ["sep", 9], ["oct", 10], ["nov", 11], ["dec", 12],
];

const emptyStats = () => ({
  numberOfUsers: 0, totalRevenue: 0, recovery: 0,
  pending: 0, unpaid: 0, partial: 0, paid: 0,
});

export async function fetchStatsServerAction(_, formData) {
  try {
    const monthRaw = formData.get("month")?.toLowerCase().trim();
    const yearRaw = formData.get("year");

    if (!monthRaw || !yearRaw)
      return { ok: false, searchComplete: false, stats: emptyStats(), message: "Month and year are required." };

    const month = MONTHS.find((m) => monthRaw.startsWith(m[0]))?.[1] ?? null;
    const year = Number(yearRaw) || null;
    const adminId = 1;

    if (!month || !year)
      return { ok: false, searchComplete: false, stats: emptyStats(), message: "Invalid month or year." };

    const [statsResult, statusResult] = await Promise.all([
      db.execute(
        `SELECT COUNT(*) AS total_users, SUM(amount_due) AS total_revenue,
         SUM(amount_paid) AS recovery, SUM(remaining_fee) AS pending
         FROM billing_transactions
         WHERE admin_id = ? AND billing_month = ? AND billing_year = ?`,
        [adminId, month, year]
      ),
      db.execute(
        `SELECT fee_status, COUNT(*) AS count
         FROM billing_transactions
         WHERE admin_id = ? AND billing_month = ? AND billing_year = ?
         GROUP BY fee_status`,
        [adminId, month, year]
      ),
    ]);

    const row = statsResult.rows[0] ?? {};

    // If no rows exist for this period the COUNT returns 0, not missing rows
    if (Number(row.total_users) === 0)
      return { ok: false, searchComplete: false, stats: emptyStats(), message: "No records found for this period." };

    let unpaid = 0, partial = 0, paid = 0;
    statusResult.rows.forEach((r) => {
      if (r.fee_status === "unpaid") unpaid = Number(r.count) || 0;
      if (r.fee_status === "partial") partial = Number(r.count) || 0;
      if (r.fee_status === "paid") paid = Number(r.count) || 0;
    });

    const stats = {
      numberOfUsers: Number(row.total_users) || 0,
      totalRevenue: Number(row.total_revenue) || 0,
      recovery: Number(row.recovery) || 0,
      pending: Number(row.pending) || 0,
      unpaid,
      partial,
      paid,
    };

    return { ok: true, searchComplete: true, stats, message: "" };
  } catch (error) {
    console.error("[fetchStatsServerAction]", error);
    return { ok: false, searchComplete: false, stats: emptyStats(), message: "Database error. Please try again." };
  }
}