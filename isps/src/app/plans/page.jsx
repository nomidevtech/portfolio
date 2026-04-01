import { db } from "@/app/lib/turso";
import ClientPlans from "./ClientPlans";
import { initPlansTable } from "../models/table-inits";

export default async function Packages() {
    await initPlansTable();
    const result = await db.execute(`SELECT public_id, speed, rate FROM plans`);

    const plans = result?.rows?.map(row => ({
        public_id: row.public_id,
        speed: Number(row.speed),
        rate: Number(row.rate)
    }));


    return (<>
        <ClientPlans plans={plans} />
    </>);
}