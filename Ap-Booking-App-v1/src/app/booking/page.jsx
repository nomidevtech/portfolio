import { getSlots } from "../lib/getSlots";

import { initBookingsTable, initWeeklyTemplateTable } from "../models/initiTables";
import ClientBooking from "./ClientBooking";

export default async function Booking() {
    await initWeeklyTemplateTable();
    await initBookingsTable();

    const d = new Date();
    const result = await getSlots(d);
    const currentMonthSlots = result.currentMonthSlots;
    const currentMonthName = result.currentMonthName;


    return (<>
        <ClientBooking currentMonthSlots={currentMonthSlots} monthName={currentMonthName} />
    </>);
}