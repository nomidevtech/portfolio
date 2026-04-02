import { db } from "@/app/lib/turso";
import ClientPlans from "./ClientPlans";
import { initPlansTable } from "../models/table-inits";
import { getUser } from "../lib/getUser";
import { redirect } from "next/navigation";

export default async function Packages() {
    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");

    const adminId = currentUser.id;


    await initPlansTable();
    const result = await db.execute(`SELECT public_id, speed, rate FROM plans WHERE admin_id = ?`, [adminId]);

    const plans = result?.rows?.map(row => ({
        public_id: row.public_id,
        speed: Number(row.speed),
        rate: Number(row.rate)
    }));


    return (<>
        <ClientPlans plans={plans} />
    </>);
}