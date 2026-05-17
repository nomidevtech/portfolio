import Link from "next/link";

export default async function ByDoctors({ fetchedDoctors = [], navString = "" }) {
    let doctors = fetchedDoctors.rows;
    doctors = doctors?.map(doctor => ({
        public_id: doctor.public_id,
        name: doctor.name,
        department: doctor.department[0].toUpperCase() + doctor.department.slice(1)
    })) || [];

    let departments = doctors.map(doctor => doctor.department);
    departments = [...new Set(departments)];
    departments = departments.map(d => d[0].toUpperCase() + d.slice(1));

    return (
        <div className="grid gap-5">
            {departments.length > 0 ? departments.map(dep => (
                <section key={dep} className="section-panel">
                    <h2 className="text-xl font-black text-slate-950">{dep.split(" ").map(fn => fn[0].toUpperCase() + fn.slice(1)).join(" ")}</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {doctors.filter(doc => doc.department === dep).map(doc => (
                            <Link
                                key={doc.public_id}
                                href={`/${navString}/${doc.public_id}`}
                                className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 font-semibold text-slate-800 hover:border-teal-300 hover:bg-white"
                            >
                                Dr. {doc.name[0].toUpperCase() + doc.name.slice(1)}
                            </Link>
                        ))}
                    </div>
                </section>
            )) : (
                <p className="section-panel text-slate-600">No doctors found.</p>
            )}
        </div>
    );
}
