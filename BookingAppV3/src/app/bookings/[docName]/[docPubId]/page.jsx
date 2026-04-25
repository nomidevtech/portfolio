import { db } from "@/app/lib/turso";
import { initBookingsTable } from "@/app/Models/initTables";

export default async function DoctorBookings({ params }) {

  const { docName, docPubId } = await params;
  const adminId = 1;

  const fetch = await db.execute(`SELECT * FROM doctors where name = ? AND public_id = ?`, [docName.toLowerCase(), docPubId]);
  if (fetch.rows.length === 0) return <p>Broken Link. Please try again.</p>;

  const { id } = fetch.rows[0];

  const fetchSlots = await db.execute(`SELECT * FROM slots WHERE admin_id = ? AND doctor_id = ? AND full_date_at_period > DATE('now') ORDER BY full_date_at_period`, [adminId, id]);
  if (fetchSlots.rows.length === 0) return <p>No slots available.</p>;

  console.log(fetchSlots.rows);
  await initBookingsTable();

  return (<>
    <div>{docName}{docPubId}</div>
  </>);
}