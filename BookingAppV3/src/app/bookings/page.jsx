import Link from "next/link";
import { db } from "../lib/turso";

export default async function Bookings() {

    const adminId = 1;

    const fetch = await db.execute(`SELECT doctor_id FROM slots WHERE admin_id = ? AND full_date_at_period > DATE('now') ORDER BY full_date_at_period`, [adminId]);

    if (fetch.rows.length === 0) return <p>No slots available.</p>;


    const doctorIds = [...new Set(fetch.rows.map(doc => doc.doctor_id))];

    const placeHolders = doctorIds.map(() => "?").join(',');

    const fetchDoctors = await db.execute(`SELECT * FROM doctors WHERE admin_id = ? AND id IN (${placeHolders})`, [adminId, ...doctorIds]);
    const doctors = fetchDoctors.rows;

    const departments = [...new Set(fetchDoctors.rows.map(doc => doc.department))];
    console.log(departments);

    if (doctors.length === 0 || departments.length === 0) return <p>No slots available.</p>;


    return (<>
        {departments.map(dep => (
            <div key={dep} className="border-2 border-amber-950 my-4" >
                <h2>Department: {dep[0].toUpperCase() + dep.slice(1)}</h2>
                <details>
                    <summary>Show Avaialbe Doctors</summary>
                    {doctors.filter(doc => doc.department === dep).map(doc => (
                        <Link key={doc.public_id} href={`/bookings/${doc.name.toLowerCase()}/${doc.public_id}`} >{doc.name[0].toUpperCase() + doc.name.slice(1)}</Link>
                    ))}
                </details>

            </div>
        ))}
    </>);
}