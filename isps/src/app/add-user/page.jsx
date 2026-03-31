import { db } from "@/app/lib/turso";
import AddUserClient from "./AddUserClient";

export default async function AddUser() {
    const fetchCurrentPlans = await db.execute(`SELECT public_id, speed FROM plans`);

    const currentPlans = fetchCurrentPlans.rows.map(row => ({
        public_id: row.public_id,
        speed: Number(row.speed),
    }));

    return (
        <AddUserClient plans={currentPlans} />
    );
}