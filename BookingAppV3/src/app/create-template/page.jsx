import Link from "next/link";
import { db } from "../lib/turso";
import { initWeeklyTemplatesTable } from "../Models/initTables";

export default async function CreateTemplate() {
    await initWeeklyTemplatesTable();

    const fetchDoctors = await db.execute(`SELECT * FROM doctors`);

    let doctors = fetchDoctors.rows;
    doctors = doctors?.map(doctor => ({ public_id: doctor.public_id, name: doctor.name, department: doctor.department[0].toUpperCase() + doctor.department.slice(1) })) || [];

    let departments = doctors.map(doctor => doctor.department);
    departments = [...new Set(departments)];
    departments = departments.map(d => d[0].toUpperCase() + d.slice(1));

    console.log(departments)
    console.log(doctors)


    return (<>
        {departments.length > 0 && departments.map(dep => (
            <div key={dep} className="border-2 border-amber-950 my-4">
                <h2>{dep}</h2>
                {doctors.filter(doc => doc.department === dep).map(doc => (
                    <Link key={doc.public_id} href={`/create-template/${doc.public_id}`} >{doc.name}</Link>
                ))}
            </div>

        ))}
    </>);
}