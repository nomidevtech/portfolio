import { db } from "@/app/lib/turso";
import AddUserClient from "./AddUserClient";

export default async function AddUser() {
    const fetchCurrentPlans = await db.execute(`SELECT public_id, speed, rate AS fee FROM plans`);

    const currentPlans = fetchCurrentPlans.rows.map(row => ({
        public_id: row.public_id,
        speed: Number(row.speed),
        fee: Number(row.fee)
    }));

    return (
        <AddUserClient plans={currentPlans} />
    );
}