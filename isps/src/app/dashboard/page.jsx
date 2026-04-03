import { redirect } from "next/navigation";
import { getUser } from "../lib/getUser";
import { db } from "../lib/turso";
import { updateRecords } from "../lib/update-records";
import ClientDashboard from "./ClientDashboard";

export default async function Dashboard() {

    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");

    const adminId = currentUser.id;
    const d = new Date();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    try {
        await updateRecords();

        const fetchStats = await db.execute(
            `SELECT COUNT(*) AS total_users, SUM(amount_due) AS total_revenue, SUM(amount_paid) AS recovery, SUM(remaining_fee) AS pending 
         FROM billing_transactions WHERE admin_id = ? AND (billing_month = ? AND billing_year = ? AND user_id IS NOT NULL)`,
            [adminId, month, year]
        );



        const fetchStatus = await db.execute(
            `SELECT fee_status, COUNT(*) AS count FROM billing_transactions
            WHERE admin_id = ? AND user_id IS NOT NULL AND billing_month = ? AND billing_year = ?
            GROUP BY fee_status`,
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


        return (
            <ClientDashboard
                initialData={initialData}
                yearsArr={yearsArr}
                monthsArr={monthsArr}
                usersByFeeStatus={usersByFeeStatus}
            />
        );




    } catch (error) {
        console.error(error);
        return <p>Failed to load dashboard. Please refresh.</p>;
    }


}