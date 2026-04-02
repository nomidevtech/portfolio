import { db } from "@/app/lib/turso";
import AddUserClient from "./AddUserClient";
import { getUser } from "../lib/getUser";
import { redirect } from "next/navigation";

export default async function AddUser() {

    const currentUser = await getUser();
    if (!currentUser?.id) redirect("/login");


    const fetchCurrentPlans = await db.execute(`SELECT public_id, speed, rate AS fee FROM plans WHERE admin_id = ?`, [currentUser.id]);

    const currentPlans = fetchCurrentPlans.rows.map(row => ({
        public_id: row.public_id,
        speed: Number(row.speed),
        fee: Number(row.fee)
    })) || [];

    return (
        <AddUserClient plans={currentPlans} />
    );
}