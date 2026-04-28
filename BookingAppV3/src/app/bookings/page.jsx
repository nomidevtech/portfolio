import Link from "next/link";
import { db } from "../lib/turso";
import { rollingWindow } from "../lib/rollingWindow";
import { initBookingsTable } from "../Models/initTables";

export default async function Bookings() {
    
    const adminId = 1;
    await rollingWindow();

    const fetch = await db.execute(`SELECT doctor_id FROM slots WHERE admin_id = ? AND full_date_at_period > DATE('now') ORDER BY full_date_at_period`, [adminId]);

    if (fetch.rows.length === 0) return <p>No slots available.</p>;


    const doctorIds = [...new Set(fetch.rows.map(doc => doc.doctor_id))];

    const placeHolders = doctorIds.map(() => "?").join(',');

    const fetchDoctors = await db.execute(`SELECT * FROM doctors WHERE admin_id = ? AND id IN (${placeHolders})`, [adminId, ...doctorIds]);
    const doctors = fetchDoctors.rows;

    const departments = [...new Set(fetchDoctors.rows.map(doc => doc.department))];


    if (doctors.length === 0 || departments.length === 0) return <p>No slots available.</p>;

    const fetchDocWithTreatment = await db.execute(`SELECT 
            d.id AS doctor_id,
            d.public_id AS doctor_public_id,
            d.name AS doctor_name,
            t.id AS treatment_id,
            t.public_id AS treatment_public_id,
            t.name AS treatment_name,
            t.duration
            FROM doctors d
            JOIN doctor_treatments dt 
            ON d.id = dt.doctor_id
            JOIN treatments t 
            ON t.id = dt.treatment_id
            WHERE d.admin_id = ?;`, [adminId]);

    const arr = [];

    fetchDocWithTreatment.rows.forEach(fn1 => {
        let doctor = arr.find(fn2 => fn2.doctor_id === fn1.doctor_id);

        if (!doctor) {
            arr.push({ doctor_id: fn1.doctor_id, doctor_public_id: fn1.doctor_public_id, doctor_name: fn1.doctor_name, treatments: [] });
            doctor = arr.find(fn2 => fn2.doctor_id === fn1.doctor_id);
        }

        doctor.treatments.push({ name: fn1.treatment_name, duration: fn1.duration, public_id: fn1.treatment_public_id });
    });

    return (<>
        {departments.map(dep => (
            <div key={dep} className="border-2 border-amber-950 my-4" >
                <h2>Department: {dep[0].toUpperCase() + dep.slice(1)}</h2>
                <details>
                    <summary>Show Avaialbe Doctors</summary>
                    {doctors.filter(doc => doc.department === dep).map(doc => {
                        const doctorWithTreatments = arr.find(d => d.doctor_id === doc.id);
                        return (
                            <div key={doc.public_id} className="border-2">
                                <p>Dr. {doc.name[0].toUpperCase() + doc.name.slice(1)}</p>
                                <p>Qualifications: {JSON.parse(doc.qualifications).join(', ').toUpperCase()}</p>

                                {doctorWithTreatments?.treatments.map(tr => (
                                    <span key={tr.public_id} className="border-2 p-2">
                                        <Link

                                            href={`/bookings/${doc.name.toLowerCase()}/${doc.public_id}/${tr.public_id}`}
                                        >
                                            {tr.name} ({tr.duration} mins)
                                        </Link>
                                    </span>
                                ))}
                            </div>
                        );
                    })}
                </details>

            </div>
        ))}
    </>);
}