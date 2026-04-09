import { db } from "../lib/turso";
import { Client2Child } from "./client2Child";

export default async function Client2() {

    const fetch = await db.execute(`SELECT * FROM slots;`);
    const baseSlotsRaw = fetch.rows[0];

    if (!baseSlotsRaw) return <p>You have to make a shedule first.</p>

    const baseSlot = JSON.parse(baseSlotsRaw?.base_slot);

    const buffer = 10;
    const rootCanal = 90;
    const cavity = 30;
    const generalCheck = 15;


    return (
        <Client2Child
            baseSlot={baseSlot}
            buffer={buffer}
            rootCanal={rootCanal}
            cavity={cavity}
            generalCheck={generalCheck}
        />
    );
}




