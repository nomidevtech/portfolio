import { db } from "../lib/turso";
import ClientDashboard from "./ClientDashboard";
import ClientDashboard2 from "./ClientDashboard copy";

export default async function Dashboard() {

    const adminId = 1;
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    const fetchStats = await db.execute(`SELECT COUNT(*) AS total_users, SUM(amount_due) AS total_revenue, SUM(amount_paid) AS recovery, SUM(remaining_fee) AS pending FROM billing_transactions WHERE admin_id = ? AND (billing_month = ? AND billing_year = ?)`, [adminId, month, year]);

    const fetchStatus = await db.execute(`SELECT fee_status, COUNT(*) AS count FROM billing_transactions WHERE admin_id = ? AND (billing_month = ? AND billing_year = ?) GROUP BY fee_status`, [adminId, month, year]);


    const numberOfUsers = fetchStats.rows[0].total_users;
    const totalRevenue = fetchStats.rows[0].total_revenue;
    const recovery = fetchStats.rows[0].recovery;
    const pending = fetchStats.rows[0].pending;
    let unpaid = 0;
    let partial = 0;
    let paid = 0;

    fetchStatus.rows.forEach(row => {
        if (row.fee_status === "unpaid") unpaid = row.count;
        if (row.fee_status === "partial") partial = row.count;
        if (row.fee_status === "paid") paid = row.count;
    });

    const payload = {
        numberOfUsers,
        totalRevenue,
        recovery,
        pending,
        unpaid,
        partial,
        paid
    };

    //console.log(payload);

    // for AI 
    //     {
    //   numberOfUsers: 6,
    //   totalRevenue: 4600,
    //   recovery: 2500,
    //   pending: 2100,
    //   unpaid: 3,
    //   partial: 1,
    //   paid: 2
    // }

    const yearsArr = [2026, 2025];
    const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];



    return (<>
        {/* <ClientDashboard payload={payload} /> */}
        <ClientDashboard2 payload={payload} yearsArr={yearsArr} monthsArr={monthsArr} />
    </>);
}