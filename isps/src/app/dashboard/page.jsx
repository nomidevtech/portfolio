import { redirect } from "next/navigation";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import { updateRecords } from "../lib/update-records";
import ClientDashboard from "./ClientDashboard";

export default async function Dashboard() {

    const currentUser = await getUser();
    if (!currentUser?.id) return redirect("/login");

    const adminId = currentUser.id;
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    await updateRecords();

    const fetchStats = await db.execute(
        `SELECT COUNT(*) AS total_users, SUM(amount_due) AS total_revenue, SUM(amount_paid) AS recovery, SUM(remaining_fee) AS pending 
         FROM billing_transactions WHERE admin_id = ? AND (billing_month = ? AND billing_year = ?)`,
        [adminId, month, year]
    );

    const fetchStatus = await db.execute(
        `SELECT DISTINCT billing_year AS years FROM billing_transactions 
         WHERE admin_id = ? AND (billing_month = ? AND billing_year = ?)`,
        [adminId, month, year]
    );

    const fetchYears = await db.execute(
        `SELECT DISTINCT billing_year FROM billing_transactions 
         WHERE admin_id = ? `,
        [adminId]
    );

    const stats = {
        numberOfUsers: fetchStats.rows[0]?.total_users || 0,
        totalRevenue: fetchStats.rows[0]?.total_revenue || 0,
        recovery: fetchStats.rows[0]?.recovery || 0,
        pending: fetchStats.rows[0]?.pending || 0,
        unpaid: 0,
        partial: 0,
        paid: 0
    };

    fetchStatus.rows.forEach(row => {
        if (row.fee_status === "unpaid") stats.unpaid = row.count || 0;
        if (row.fee_status === "partial") stats.partial = row.count || 0;
        if (row.fee_status === "paid") stats.paid = row.count || 0;
    });

    const initialData = {
        ok: true,
        searchComplete: true,
        stats,
        message: ""
    };

    const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const yearsArr = fetchYears.rows.map(row => row.billing_year);

    console.log(yearsArr);

    return (
        <ClientDashboard
            initialData={initialData}
            yearsArr={yearsArr}
            monthsArr={monthsArr}
        />
    );
}