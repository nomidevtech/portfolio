import { redirect } from "next/navigation";
import { getUser } from "../lib/getUser";
import MiddleClient from "./MiddleClient";
import { db } from "../lib/turso";

export default async function EditUser() {

    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");


    const fetchPlans = await db.execute(`SELECT public_id, speed, rate FROM plans WHERE admin_id = ?`, [currentUser.id]);
    const plans = fetchPlans.rows.map(row => ({
        public_id: row.public_id,
        speed: Number(row.speed),
        rate: Number(row.rate)
    })) || [];


    return (
        <MiddleClient plans={plans} />
    );
}