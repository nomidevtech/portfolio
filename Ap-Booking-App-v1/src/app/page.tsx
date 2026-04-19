import Link from "next/link";
import { initBookingsTable, initDoctorsTable, initWeeklyTemplateTable } from "./models/initiTables";

export default async function Home() {

  await initBookingsTable();
  await initDoctorsTable();
  await initWeeklyTemplateTable();

  return (<>
    <Link href="/manage-weekly-template">Manage Weekly Template</Link>
    <Link href="/booking">Booking</Link>
    <Link href="/add-doctor">Add Doctor</Link>
    <Link href="/appointments">Appointments</Link>

  </>);
}
