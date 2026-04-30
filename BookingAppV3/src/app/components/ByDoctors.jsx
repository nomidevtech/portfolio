import Link from "next/link";

export default async function ByDoctors({ fetchedDoctors = [], navString = "" }) {


    let doctors = fetchedDoctors.rows;
    doctors = doctors?.map(doctor => ({ public_id: doctor.public_id, name: doctor.name, department: doctor.department[0].toUpperCase() + doctor.department.slice(1) })) || [];

    let departments = doctors.map(doctor => doctor.department);
    departments = [...new Set(departments)];
    departments = departments.map(d => d[0].toUpperCase() + d.slice(1));

    return (<>
        {departments.length > 0 && departments.map(dep => (
            <div key={dep} className="border-2 border-amber-950 my-4">
                <h2>{dep.split(" ").map(fn => fn[0].toUpperCase() + fn.slice(1)).join(" ")}</h2>
                {doctors.filter(doc => doc.department === dep).map(doc => (
                    <Link key={doc.public_id} href={`/${navString}/${doc.public_id}`} >{doc.name[0].toUpperCase() + doc.name.slice(1)}</Link>
                ))}
            </div>

        ))}
    </>);
}