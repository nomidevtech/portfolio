import Link from "next/link";
import { initBookingsTable } from "../../models/initiTables";
import ClientBooking from "./ClientBooking";
import { db } from "../../lib/turso";
import { getSlots } from "../../lib/getSlots";

export default async function Slots({ params }) {

    const { pId } = await params;
    const fetchDoctors = await db.execute(`SELECT * FROM doctors WHERE public_id = ?`, [pId]);
    const doctorId = fetchDoctors.rows[0].id;

    if (!doctorId) return <div>Doctor not found</div>

    const monthsCode = [
        { month: "January", code: 0 }, { month: "February", code: 1 }, { month: "March", code: 2 },
        { month: "April", code: 3 }, { month: "May", code: 4 }, { month: "June", code: 5 },
        { month: "July", code: 6 }, { month: "August", code: 7 }, { month: "September", code: 8 },
        { month: "October", code: 9 }, { month: "November", code: 10 }, { month: "December", code: 11 }
    ];

    const d = new Date();
    const currentMonthNumber = d.getMonth();
    const currentMonthName = monthsCode.find((mn) => mn.code === currentMonthNumber).month;
    const result = await getSlots(d, doctorId);

    if (result.length === 0) return <>
        <p>There are no slots. Go to Manage Weekly Template</p>
        <Link href="/manage-weekly-template"> 👉 Manage Weekly Template</Link>
    </>


    return (<>
        <ClientBooking currentMonthSlots={result} monthName={currentMonthName} />
    </>);
}